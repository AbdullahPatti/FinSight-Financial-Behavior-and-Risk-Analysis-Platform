from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
import numpy as np
import joblib
import re
from sqlalchemy.orm import Session
from db import get_db
from Core.pipelines import run_full_pipeline
from Crud.transaction import bulk_insert_transactions
from Schemas.transaction import SingleExpenseInput
from Crud.quarterly import bulk_insert_quarterly
from Models.quarterly import QuarterlySummary
from Models.transactions import Transaction
from openai import OpenAI
router = APIRouter()

@router.post("/")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        if not file.filename.endswith(".csv"):
            return {"error": "Only CSV files are allowed"}
        
        print(f"\nReceived file: {file.filename}")
        content = await file.read()
        print(f"File size: {len(content)} bytes")
        
        with open("temp_upload.csv", "wb") as f:
            f.write(content)
        print("File saved as temp_upload.csv")
        
        success = run_full_pipeline("temp_upload.csv")
        
        if success:
            try:
                print("\nInserting transactions into database...")
                bulk_insert_transactions(db)
                print("Transactions inserted successfully!")
                
                print("Inserting quarterly summary into database...")
                bulk_insert_quarterly(db)
                print("Quarterly summary inserted successfully!")
                
                return {"message": "File uploaded and processed successfully", "status": "success"}
            except Exception as db_error:
                print(f"Database insertion error: {str(db_error)}")
                import traceback
                print(traceback.format_exc())
                return {"error": f"Database error: {str(db_error)}"}
        else:
            return {"error": "Pipeline processing failed - check server logs for details"}
    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"error": f"Upload failed: {str(e)}"}

def analyze_single_expense(expense: SingleExpenseInput, db: Session):
    try:
        # 1. Fetch Quarterly Data if needed
        quarter_data = db.query(QuarterlySummary).filter(
            QuarterlySummary.fiscal_year == f"FY{expense.fiscal_year}",
            QuarterlySummary.quarter == f"Q{expense.quarter}"
        ).first()

        if not quarter_data:
            # Try to get the latest available quarter if specific one not found
            quarter_data = db.query(QuarterlySummary).order_by(
                QuarterlySummary.fiscal_year.desc(), 
                QuarterlySummary.quarter.desc()
            ).first()

        if not quarter_data:
             return {"error": "No quarterly data found in database. Please upload a CSV first."}

        # 2. NLP Prediction
        tfidf = joblib.load('tfidf_vectorizer.pkl')
        nlp_model = joblib.load('nlp_logreg.pkl')
        le = joblib.load('label_encoder.pkl')
        
        desc_clean = re.sub(r'[^a-z\s]', ' ', expense.transaction_description.lower())
        X_tfidf = tfidf.transform([desc_clean])
        predicted_idx = nlp_model.predict(X_tfidf)
        predicted_category = le.inverse_transform(predicted_idx)[0]

        # 3. Anomaly Detection
        # Calculate features similar to pipeline
        log_amount = np.log(expense.amount_pkr)
        
        # Get department stats for z-score
        dept_stats = db.query(
            Transaction.department,
            Transaction.amount_pkr
        ).filter(Transaction.department == expense.department).all()
        
        if dept_stats:
            amounts = [t[1] for t in dept_stats]
            dept_mean = np.mean(amounts)
            dept_std = np.std(amounts) if len(amounts) > 1 else 1.0
            amount_zscore_dept = (expense.amount_pkr - dept_mean) / (dept_std if dept_std != 0 else 1.0)
        else:
            amount_zscore_dept = 0.0

        amount_revenue_ratio = expense.amount_pkr / quarter_data.quarterly_revenue
        debt_ratio = quarter_data.debt_to_asset # Assuming debt_to_asset is what's used
        current_ratio = quarter_data.current_ratio
        
        # Vendor stats
        vendor_stats = db.query(Transaction).filter(Transaction.vendor_name == expense.vendor_name).all()
        vendor_freq = len(vendor_stats) + 1
        if vendor_stats:
            vendor_avg_amount = np.mean([t.amount_pkr for t in vendor_stats])
        else:
            vendor_avg_amount = expense.amount_pkr
            
        is_cash = 1 if expense.payment_method == 'Cash' else 0

        # Construct feature vector for Anomaly Model
        # This part is tricky because of OneHotEncoding from the pipeline.
        # We need the scaler to see the same columns.
        scaler = joblib.load('anomaly_scaler.pkl')
        iso_model = joblib.load('isolation_forest.pkl')
        
        # Create a DataFrame with all expected features, filled with 0.0 to ensure float dtype
        input_df = pd.DataFrame(columns=scaler.feature_names_in_)
        input_df.loc[0] = 0.0
        
        # Ensure all columns are float type to avoid LossySetitemError/TypeError with float values
        input_df = input_df.astype(float)
        
        # Fill numeric features
        input_df.at[0, 'log amount'] = log_amount
        input_df.at[0, 'amount_zscore_dept'] = amount_zscore_dept
        input_df.at[0, 'amount / quarterly_revenue'] = amount_revenue_ratio
        input_df.at[0, 'debt_ratio'] = debt_ratio
        input_df.at[0, 'current_ratio'] = current_ratio
        input_df.at[0, 'vendor_freq'] = vendor_freq
        input_df.at[0, 'vendor_avg_amount'] = vendor_avg_amount
        input_df.at[0, 'is_cash'] = is_cash
        input_df.at[0, 'quarterly_revenue_pkr'] = quarter_data.quarterly_revenue
        
        # Fill categorical OHE columns
        cat_cols = {
            f'expense_category_{predicted_category}': 1,
            f'payment_method_{expense.payment_method}': 1,
            f'quarter_Q{expense.quarter}': 1
        }
        for col, val in cat_cols.items():
            if col in input_df.columns:
                input_df.at[0, col] = val

        X_scaled = scaler.transform(input_df)
        anomaly_score = iso_model.score_samples(X_scaled)[0]
        
        # Use a reasonable threshold or the one from training if we had it.
        # Here we'll just check if it's considered an outlier by IsolationForest (typically score < 0)
        is_anomaly = bool(iso_model.predict(X_scaled)[0] == -1)
        if is_anomaly == True:
            prompt = f"""You are a financial fraud detection assistant for a corporate expense monitoring system.

            Your task: Given a flagged transaction, return exactly TWO sentences:
            1. The primary reason this transaction was flagged as anomalous (cite specific metric names and values).
            2. Whether this flag appears legitimate or likely a false positive, and why.

            No preamble, no labels, no bullet points — just the two sentences.

            Transaction:
            - Department: {expense.department}
            - Category: {predicted_category}
            - Vendor: {expense.vendor_name} (seen {vendor_freq}x, avg PKR {vendor_avg_amount:.0f})
            - Description: {expense.transaction_description}
            - Amount: PKR {expense.amount_pkr:,.0f}
            - Payment Method: {expense.payment_method}

            Anomaly Signals:
            - Is Anomaly (Isolation Forest): {is_anomaly}  ← model flagged this as an outlier
            - Anomaly Score: {anomaly_score:.4f}           ← closer to -1 = more anomalous, near 0 = borderline
            - Dept Z-Score: {amount_zscore_dept:.2f}       ← std devs above dept average (suspicious if > 2.0)
            - Amount/Revenue Ratio: {amount_revenue_ratio:.6f}  ← suspicious if disproportionately high
            - Vendor Frequency: {vendor_freq}              ← suspicious if very low (rare/unknown vendor)
            - Vendor Avg Amount: PKR {vendor_avg_amount:.0f}    ← suspicious if current amount far exceeds this
            - HMM Financial State: {quarter_data.hmm_state}    ← company's financial regime this quarter (e.g. Financially Stable, Distressed, Recovery, Under Pressure); 
            - Risk Band: {quarter_data.risk_band}              ← overall risk tier assigned to this quarter (Low / Medium / High); High means the company is already under financial stress


            Rules:
            1. Sentence 1 — cite the top 1-2 metrics that most strongly support the anomaly flag (include their values).
            2. Sentence 2 — if the anomaly score is borderline (close to 0), z-score is low, and vendor is familiar, lean toward false positive. Otherwise, confirm the flag as likely legitimate.
            3. Plain business language. No jargon. Hard limit: 50 words total across both sentences.
            4. Output only the two sentences."""

            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key="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"
            )

            response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert financial anomaly detection analyst."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
            )

            result = response.choices[0].message.content.strip()
        else:
            result = "Transaction is not an anomaly."
        return {
            "predicted_category": predicted_category,
            "is_anomaly": is_anomaly,
            "anomaly_score": float(anomaly_score),
            "hmm_state": quarter_data.hmm_state,
            "risk_band": quarter_data.risk_band,
            "response": result
        }
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"error": f"Analysis failed: {str(e)}"}

@router.post("/single")
async def analyze_single(expense: SingleExpenseInput, db: Session = Depends(get_db)):
    return analyze_single_expense(expense, db)
