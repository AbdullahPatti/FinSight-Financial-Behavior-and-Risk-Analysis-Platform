from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from App.db import get_db
from App.Models.transactions import Transaction
from App.Models.users import User
from App.Crud.transaction import get_transactions
from App.Routers.auth import get_current_user
import io
import csv
from datetime import datetime

router = APIRouter()


@router.get("/export-anomalies")
def export_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← requires valid JWT
):
    transactions = get_transactions(db=db, user_id=current_user.id, skip=0, limit=100000, anomaly=True)

    output = io.StringIO()
    writer = csv.writer(output)
    headers = [
        "transaction_id", "date", "department", "expense_category",
        "transaction_description", "amount_pkr", "approval_status",
        "is_anomaly", "review_tier", "vendor_name", "payment_method",
    ]
    writer.writerow(headers)
    for t in transactions:
        writer.writerow([
            t.transaction_id, t.date, t.department, t.expense_category,
            t.transaction_description, t.amount_pkr, t.approval_status,
            t.is_anomaly, t.review_tier, t.vendor_name, t.payment_method,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                f"attachment; filename=anomalies_export_{datetime.now().strftime('%Y-%m-%d')}.csv"
        },
    )


@router.get("/")
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    anomaly: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← requires valid JWT
):
    transactions = get_transactions(
        db=db, user_id=current_user.id, skip=skip, limit=limit,
        department=department, category=category, anomaly=anomaly,
    )
    return {
        "total": len(transactions),
        "transactions": [t.__dict__ for t in transactions],
    }


@router.get("/{transaction_id}")
def get_single_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← requires valid JWT
):
    txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id, Transaction.user_id == current_user.id).first()
    if not txn:
        return {"error": "Transaction not found"}
    return txn.__dict__