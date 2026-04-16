from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from db import get_db
from Models.transactions import Transaction
from Crud.transaction import get_transactions

router = APIRouter()

@router.get("/")
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    anomaly: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    transactions = get_transactions(
        db=db,
        skip=skip,
        limit=limit,
        department=department,
        category=category,
        anomaly=anomaly
    )
    
    return {
        "total": len(transactions),
        "transactions": [t.__dict__ for t in transactions]
    }


@router.get("/{transaction_id}")
def get_single_transaction(transaction_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    if not txn:
        return {"error": "Transaction not found"}
    return txn.__dict__