from sqlalchemy.orm import Session
from Models.transactions import Transaction
import pandas as pd
import os

def bulk_insert_transactions(db: Session):
    if not os.path.exists("NovaTech_HMM.csv"):
        return False
    df = pd.read_csv("NovaTech_HMM.csv")
    
    for _, row in df.iterrows():
        txn = Transaction(
            transaction_id=row['transaction_id'],
            date=pd.to_datetime(row['date']).date(),
            fiscal_year=row['fiscal_year'],
            quarter=row['quarter'],
            department=row.get('department'),
            expense_category=row.get('expense_category'),
            vendor_name=row.get('vendor_name'),
            transaction_description=row.get('transaction_description'),
            amount_pkr=float(row['amount_pkr']),
            payment_method=row.get('payment_method'),
            approval_status=row.get('approval_status'),
            hmm_state=row.get('hmm_state'),
            is_anomaly=bool(row.get('is_anomaly', 0)),
            review_tier=row.get('review_tier'),
            predicted_category=row.get('predicted_category')
        )
        db.add(txn)
    db.commit()
    return True

def get_transactions(db: Session, skip: int = 0, limit: int = 50, department=None, category=None, anomaly=None):
    query = db.query(Transaction)
    if department:
        query = query.filter(Transaction.department == department)
    if category:
        query = query.filter(Transaction.expense_category == category)
    if anomaly is not None:
        query = query.filter(Transaction.is_anomaly == anomaly)
    return query.offset(skip).limit(limit).all()