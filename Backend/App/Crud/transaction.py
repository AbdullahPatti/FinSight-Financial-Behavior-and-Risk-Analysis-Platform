from sqlalchemy.orm import Session
from App.Models.transactions import Transaction
import pandas as pd
import os

def bulk_insert_transactions(db: Session, user_id: int):
    # Path to Data directory relative to this file's directory (App/Crud/)
    # Backend/App/Crud/transaction.py -> Backend/Data/user_{user_id}/temp_hmm.csv
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Data")
    data_path = os.path.join(data_dir, f"user_{user_id}", "temp_hmm.csv")
    
    if not os.path.exists(data_path):
        print(f"File not found: {data_path}")
        return False
    df = pd.read_csv(data_path)
    
    new_count = 0
    skipped_count = 0
    
    for _, row in df.iterrows():
        transaction_id = row['transaction_id']
        
        # Check if transaction already exists for this user
        existing = db.query(Transaction).filter(
            Transaction.transaction_id == transaction_id,
            Transaction.user_id == user_id
        ).first()
        if existing:
            skipped_count += 1
            continue
        
        txn = Transaction(
            transaction_id=transaction_id,
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
            predicted_category=row.get('predicted_category'),
            user_id=user_id
        )
        db.add(txn)
        new_count += 1
    
    db.commit()
    print(f"Inserted {new_count} new transactions, skipped {skipped_count} duplicates")
    return True

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 50, department=None, category=None, anomaly=None):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if department:
        query = query.filter(Transaction.department == department)
    if category:
        query = query.filter(Transaction.expense_category == category)
    if anomaly is not None:
        query = query.filter(Transaction.is_anomaly == anomaly)
    return query.offset(skip).limit(limit).all()
