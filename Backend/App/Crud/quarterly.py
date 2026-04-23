from sqlalchemy.orm import Session
from Models.quarterly import QuarterlySummary
import pandas as pd
import os

def bulk_insert_quarterly(db: Session):
    if not os.path.exists("risk_bands.csv"):
        return False
    df = pd.read_csv("risk_bands.csv")
    
    new_count = 0
    skipped_count = 0
    
    for _, row in df.iterrows():
        fiscal_year = row['fiscal_year']
        quarter = row['quarter']
        
        # Check if quarterly summary already exists
        existing = db.query(QuarterlySummary).filter(
            (QuarterlySummary.fiscal_year == fiscal_year) &
            (QuarterlySummary.quarter == quarter)
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
            hmm_state=row['hmm_state'],
            risk_band=row['risk_band'],
            predicted_band=row['predicted_band'],
            confidence=float(row['confidence'])
        )
        db.add(q)
        new_count += 1
    
    db.commit()
    print(f"Inserted {new_count} new quarterly summaries, skipped {skipped_count} duplicates")
    return True

def get_quarterly_summary(db: Session):
    return db.query(QuarterlySummary).all()
