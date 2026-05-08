from sqlalchemy.orm import Session
from App.Models.quarterly import QuarterlySummary
import pandas as pd
import os

def bulk_insert_quarterly(db: Session, user_id: int):
    # Path to Data directory relative to this file's directory (App/Crud/)
    # Backend/App/Crud/quarterly.py -> Backend/Data/user_{user_id}/temp_risk.csv
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Data")
    data_path = os.path.join(data_dir, f"user_{user_id}", "temp_risk.csv")
    
    if not os.path.exists(data_path):
        print(f"File not found: {data_path}")
        return False
    df = pd.read_csv(data_path)
    
    new_count = 0
    skipped_count = 0
    
    for _, row in df.iterrows():
        fiscal_year = row['fiscal_year']
        quarter = row['quarter']
        
        # Check if quarterly summary already exists for this user
        existing = db.query(QuarterlySummary).filter(
            (QuarterlySummary.fiscal_year == fiscal_year) &
            (QuarterlySummary.quarter == quarter) &
            (QuarterlySummary.user_id == user_id)
        ).first()
        if existing:
            skipped_count += 1
            continue
        
        q = QuarterlySummary(
            fiscal_year=fiscal_year,
            quarter=quarter,
            current_ratio=float(row['current_ratio']),
            debt_to_asset=float(row['debt_to_asset']),
            expense_to_revenue=float(row['expense_to_revenue']),
            anomaly_rate=float(row['anomaly_rate']),
            quarterly_revenue=float(row['quarterly_revenue']),
            long_term_loans=float(row['long_term_loans']),
            hmm_state=row['hmm_state'],
            risk_band=row['risk_band'],
            predicted_band=row['predicted_band'],
            confidence=float(row['confidence']),
            user_id=user_id
        )
        db.add(q)
        new_count += 1
    
    db.commit()
    print(f"Inserted {new_count} new quarterly summaries, skipped {skipped_count} duplicates")
    return True

def get_quarterly_summary(db: Session, user_id: int):
    return db.query(QuarterlySummary).filter(QuarterlySummary.user_id == user_id).all()
