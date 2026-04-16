from sqlalchemy.orm import Session
from Models.quarterly import QuarterlySummary
import pandas as pd
import os

def bulk_insert_quarterly(db: Session):
    if not os.path.exists("risk_bands.csv"):
        return False
    df = pd.read_csv("risk_bands.csv")
    
    for _, row in df.iterrows():
        q = QuarterlySummary(
            fiscal_year=row['fiscal_year'],
            quarter=row['quarter'],
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
    db.commit()
    return True

def get_quarterly_summary(db: Session):
    return db.query(QuarterlySummary).all()