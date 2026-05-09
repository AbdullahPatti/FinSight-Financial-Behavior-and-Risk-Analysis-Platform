from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
import numpy as np
import joblib
import re
from sqlalchemy.orm import Session
from App.db import get_db
from App.Core.pipelines import run_full_pipeline
from App.Crud.transaction import bulk_insert_transactions
from App.Schemas.transaction import SingleExpenseInput
from App.Crud.quarterly import bulk_insert_quarterly
from App.Models.quarterly import QuarterlySummary
from App.Models.transactions import Transaction
from App.Models.users import User
from App.Routers.auth import get_current_user
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

from pathlib import Path

load_dotenv()

router = APIRouter()

# Setup paths relative to Backend/App/Routers/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "Models"
DATA_DIR = BASE_DIR / "Data"


@router.post("/")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← requires valid JWT
):
    try:
        if not file.filename.endswith(".csv"):
            return {"error": "Only CSV files are allowed"}

        print(f"\nReceived file: {file.filename}")
        content = await file.read()
        print(f"File size: {len(content)} bytes")

        user_data_dir = DATA_DIR / f"user_{current_user.id}"
        user_data_dir.mkdir(parents=True, exist_ok=True)
        temp_path = user_data_dir / "temp_upload.csv"
        with open(temp_path, "wb") as f:
            f.write(content)
        print(f"File saved as {temp_path}")

        success = run_full_pipeline(str(temp_path), db=db, current_user=current_user)

        if success:
            try:
                print("\nInserting transactions into database...")
                bulk_insert_transactions(db, current_user.id)
                print("Transactions inserted successfully!")

                print("Inserting quarterly summary into database...")
                bulk_insert_quarterly(db,current_user.id)
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


def analyze_single_expense(expense: SingleExpenseInput, db: Session, user_id: int):
    try:
        user_models_dir = MODELS_DIR / f"user_{user_id}"

        # 1. Fetch Quarterly Data
        quarter_data = db.query(QuarterlySummary).filter(
            QuarterlySummary.fiscal_year == f"FY{expense.fiscal_year}",
            QuarterlySummary.quarter == f"Q{expense.quarter}",
            QuarterlySummary.user_id == user_id
        ).first()

        if not quarter_data:
            quarter_data = db.query(QuarterlySummary).filter(
                QuarterlySummary.user_id == user_id
            ).order_by(
                QuarterlySummary.fiscal_year.desc(),
                QuarterlySummary.quarter.desc()
            ).first()

        if not quarter_data:
            return {"error": "No quarterly data found in database. Please upload a CSV first."}

        # 2. NLP Prediction
        tfidf     = joblib.load(user_models_dir / 'tfidf_vectorizer.pkl')
        nlp_model = joblib.load(user_models_dir / 'nlp_logreg.pkl')
        le        = joblib.load(user_models_dir / 'label_encoder.pkl')

        desc_clean         = re.sub(r'[^a-z\s]', ' ', expense.transaction_description.lower())
        X_tfidf            = tfidf.transform([desc_clean])
        predicted_idx      = nlp_model.predict(X_tfidf)
        predicted_category = le.inverse_transform(predicted_idx)[0]

        # 3. Feature Engineering — mirrors FeatureEngineering() in anomaly_detection_pipeline.py
        log_amount = np.log(expense.amount_pkr)

        dept_stats = db.query(Transaction.department, Transaction.amount_pkr)\
            .filter(Transaction.department == expense.department, Transaction.user_id == user_id).all()

        if dept_stats:
            amounts            = [t[1] for t in dept_stats]
            dept_mean          = np.mean(amounts)
            dept_std           = np.std(amounts) if len(amounts) > 1 else 1.0
            amount_zscore_dept = (expense.amount_pkr - dept_mean) / (dept_std if dept_std != 0 else 1.0)
        else:
            amount_zscore_dept = 0.0

        amount_revenue_ratio = expense.amount_pkr / quarter_data.quarterly_revenue

        # current_ratio: current_assets / current_liabilities (pipeline fix applied)
        current_ratio = quarter_data.current_ratio

        # debt_ratio = total_liabilities / total_assets, stored as debt_to_asset in DB
        debt_ratio = quarter_data.debt_to_asset

        vendor_stats      = db.query(Transaction).filter(
            Transaction.vendor_name == expense.vendor_name,
            Transaction.user_id == user_id
        ).all()
        vendor_freq       = len(vendor_stats) + 1
        vendor_avg_amount = np.mean([t.amount_pkr for t in vendor_stats]) if vendor_stats else expense.amount_pkr
        is_cash           = 1 if expense.payment_method == 'Cash' else 0

        # 4. Load per-state model
        all_models  = joblib.load(user_models_dir / 'isolation_forests.pkl')
        all_scalers = joblib.load(user_models_dir / 'anomaly_scalers.pkl')

        hmm_state = quarter_data.hmm_state
        if hmm_state not in all_models:
            hmm_state = list(all_models.keys())[0]

        scaler    = all_scalers[hmm_state]
        iso_model = all_models[hmm_state]

        # 5. Build input DataFrame from scaler's expected columns only
        input_df = pd.DataFrame([np.zeros(len(scaler.feature_names_in_))],
                                columns=scaler.feature_names_in_)

        input_df.at[0, 'log amount']                 = log_amount
        input_df.at[0, 'amount_zscore_dept']         = amount_zscore_dept
        input_df.at[0, 'amount / quarterly_revenue'] = amount_revenue_ratio
        input_df.at[0, 'debt_ratio']                 = debt_ratio
        input_df.at[0, 'current_ratio']              = current_ratio
        input_df.at[0, 'vendor_freq']                = vendor_freq
        input_df.at[0, 'vendor_avg_amount']          = vendor_avg_amount
        input_df.at[0, 'is_cash']                    = is_cash

        for col, val in {
            f'expense_category_{predicted_category}': 1,
            f'payment_method_{expense.payment_method}': 1,
            f'quarter_Q{expense.quarter}': 1,
        }.items():
            if col in input_df.columns:
                input_df.at[0, col] = val

        X_scaled      = scaler.transform(input_df)
        anomaly_score = iso_model.score_samples(X_scaled)[0]
        is_anomaly    = bool(iso_model.predict(X_scaled)[0] == -1)
        with open(user_models_dir / 'anomaly_thresholds.json') as f:
            thresholds = json.load(f)

        TIER_HIGH   = thresholds["tier_high"]
        TIER_MEDIUM = thresholds["tier_medium"]

        if anomaly_score <= TIER_HIGH:
            review_tier = "High — review now"
        elif anomaly_score <= TIER_MEDIUM:
            review_tier = "Medium — weekly batch"
        else:
            review_tier = "Normal"

        if is_anomaly:
            prompt = f"""You are a financial auditor reviewing a flagged corporate expense. Analyze every metric below and return exactly TWO sentences.
                
                ========================
                TRANSACTION
                ========================
                Department: {expense.department}
                Category (AI-predicted): {predicted_category}
                Vendor: {expense.vendor_name} | Seen {vendor_freq} time(s) | Historical avg PKR {vendor_avg_amount:,.0f}
                Description: {expense.transaction_description}
                Amount: PKR {expense.amount_pkr:,.0f}
                Payment: {expense.payment_method}
                
                ========================
                ANOMALY METRICS
                ========================
                1. Isolation Forest Score: {anomaly_score:.4f}
                   - Range: typically -0.5 (very anomalous) to +0.5 (very normal)
                   - < -0.35 → High anomaly (matches "High — review now" tier)
                   - -0.35 to -0.20 → Moderate anomaly (matches "Medium — weekly batch" tier)
                   - > -0.20 → Weak or no anomaly (matches "Normal" tier)
                   - Note: model was trained per HMM state, so score is relative to {quarter_data.hmm_state} regime peers only
                
                2. Review Tier: {review_tier}
                   - "High — review now" → score below 2nd percentile of training data, strong outlier
                   - "Medium — weekly batch" → score between 2nd and 5th percentile, moderate outlier
                   - "Normal" → score above 5th percentile, not a statistical outlier
                
                3. Department Z-Score: {amount_zscore_dept:.2f}
                   - |z| < 1.5 → normal for this department
                   - 1.5–3.0 → moderately unusual
                   - > 3.0 → highly abnormal vs department peers
                
                4. Amount-to-Revenue Ratio: {amount_revenue_ratio:.6f}
                   - Fraction of quarterly revenue this single transaction represents
                   - > 0.01 (1%) → noteworthy for a single expense
                   - > 0.05 (5%) → strongly suspicious scale
                
                5. Vendor Familiarity:
                   - Frequency: {vendor_freq} transaction(s) on record
                   - Historical avg: PKR {vendor_avg_amount:,.0f}
                   - Deviation from avg: {((expense.amount_pkr - vendor_avg_amount) / max(vendor_avg_amount, 1) * 100):.1f}%
                   - 1–2 occurrences → unfamiliar vendor, higher suspicion
                   - 10+ occurrences → familiar vendor, supports legitimacy
                   - Deviation > 50% from avg → suspicious even for familiar vendors
                
                6. Financial Regime:
                   - HMM State: {quarter_data.hmm_state}
                   - Risk Band: {quarter_data.risk_band}
                   - "Financially Stable" + "Low" risk → anomaly less credible, likely false positive
                   - "Under Pressure" or "Distressed" + "High" risk → anomaly more credible, warrants review
                
                ========================
                REASONING RULES
                ========================
                - Sentence 1: Evaluate the 2–3 most informative metrics. State whether each is normal, suspicious, or conflicting. Be specific with values.
                - Sentence 2: Give a final verdict — legitimate flag or likely false positive — based on combined metric weight. Name the decisive factors.
                - If review_tier is "Normal" but is_anomaly is True, note this as a borderline case.
                - If vendor is familiar (10+) AND z-score < 1.5 AND review_tier is "Normal" → strongly lean false positive.
                - If review_tier is "High — review now" AND z-score > 2 AND vendor_freq < 3 → confirm as legitimate flag.
                - Conflicting signals (e.g. high z-score but familiar vendor) → acknowledge mixed signals explicitly.
                - No preamble. No labels. No bullet points. No markdown. Exactly TWO sentences. Hard limit: 60 words total.
                """

            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=os.getenv("API_KEY"),
            )
            response = client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert financial anomaly detection analyst."},
                    {"role": "user",   "content": prompt},
                ],
                temperature=0.3,
            )
            result = response.choices[0].message.content.strip()
        else:
            result = "Transaction is not an anomaly."

        return {
            "predicted_category": predicted_category,
            "is_anomaly":         is_anomaly,
            "anomaly_score":      float(anomaly_score),
            "review_tier":        review_tier,
            "hmm_state":          quarter_data.hmm_state,
            "risk_band":          quarter_data.risk_band,
            "response":           result,
        }

    except Exception as e:
        print(f"Analysis error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"error": f"Analysis failed: {str(e)}"}


@router.post("/single")
async def analyze_single(
    expense: SingleExpenseInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← requires valid JWT
):
    return analyze_single_expense(expense, db, current_user.id)