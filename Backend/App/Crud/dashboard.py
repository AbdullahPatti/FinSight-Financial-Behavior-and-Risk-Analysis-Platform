from sqlalchemy.orm import Session
from Models.transactions import Transaction
from Models.quarterly import QuarterlySummary

def get_dashboard_data(db: Session):
    latest_quarter = db.query(QuarterlySummary)\
        .order_by(QuarterlySummary.fiscal_year.desc(), QuarterlySummary.quarter.desc())\
        .first()
    
    total_expense = db.query(Transaction.amount_pkr).all()
    total_expense_sum = sum([float(t[0]) for t in total_expense]) if total_expense else 0.0

    anomaly_count = db.query(Transaction)\
        .filter(Transaction.is_anomaly == True).count()

    recent_transactions = db.query(Transaction)\
        .order_by(Transaction.date.desc())\
        .limit(5).all()

    spending_by_category = db.query(
        Transaction.expense_category,
        db.func.sum(Transaction.amount_pkr).label("amount")
    ).group_by(Transaction.expense_category)\
     .order_by(db.func.sum(Transaction.amount_pkr).desc())\
     .limit(6).all()

    spending_list = [
        {"category": cat, "amount": float(amt)} 
        for cat, amt in spending_by_category
    ]

    return {
        "current_ratio": float(latest_quarter.current_ratio) if latest_quarter else 1.62,
        "debt_ratio": float(latest_quarter.debt_to_asset) if latest_quarter else 0.48,
        "risk_band": latest_quarter.risk_band if latest_quarter else "Low",
        "total_expense": round(total_expense_sum, 2),
        "anomaly_count": anomaly_count,
        "active_users": 1240,
        "spending_by_category": spending_list,
        "risk_timeline": [
            {
                "fiscal_year": q.fiscal_year,
                "quarter": q.quarter,
                "risk_band": q.risk_band,
                "confidence": float(q.confidence)
            } for q in db.query(QuarterlySummary).order_by(QuarterlySummary.fiscal_year, QuarterlySummary.quarter).all()
        ],
        "recent_transactions": [t.__dict__ for t in recent_transactions]
    }