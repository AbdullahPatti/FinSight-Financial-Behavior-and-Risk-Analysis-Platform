from sqlalchemy.orm import Session
from Models.transactions import Transaction
from Models.quarterly import QuarterlySummary
from sqlalchemy import func
from datetime import datetime

def get_dashboard_data(db: Session, user_id: int):
    """
    Comprehensive dashboard data for financial analytics.
    Adapted to work with transaction and quarterly summary data.
    """
    
    # Get latest quarter (with null safety)
    latest_quarter = db.query(QuarterlySummary)\
        .filter(QuarterlySummary.user_id == user_id)\
        .order_by(QuarterlySummary.fiscal_year.desc(), QuarterlySummary.quarter.desc())\
        .first()
    
    # Count total transactions for current user
    total_transactions = db.query(Transaction).filter(Transaction.user_id == user_id).count()
    
    # Calculate total and average expenses for current user
    expense_stats = db.query(
        func.sum(Transaction.amount_pkr).label("total"),
        func.avg(Transaction.amount_pkr).label("average"),
        func.count(Transaction.id).label("count")
    ).filter(Transaction.user_id == user_id).first()
    
    total_expense = float(expense_stats.total) if expense_stats.total else 0.0
    avg_expense = float(expense_stats.average) if expense_stats.average else 0.0

    # Count anomalies for current user
    anomaly_count = db.query(Transaction)\
        .filter(Transaction.user_id == user_id, Transaction.is_anomaly == True).count()
    
    anomaly_rate = (anomaly_count / total_transactions * 100) if total_transactions > 0 else 0.0

    # Get recent transactions for current user
    recent_transactions = db.query(Transaction)\
        .filter(Transaction.user_id == user_id)\
        .order_by(Transaction.date.desc())\
        .limit(10).all()
    
    recent_txn_list = []
    for t in recent_transactions:
        recent_txn_list.append({
            "transaction_id": t.transaction_id,
            "date": str(t.date) if t.date else None,
            "description": t.transaction_description,
            "category": t.expense_category,
            "amount": float(t.amount_pkr),
            "status": t.approval_status,
            "is_anomaly": t.is_anomaly,
            "department": t.department
        })

    # Spending by category for current user
    spending_by_category = db.query(
        Transaction.expense_category,
        func.sum(Transaction.amount_pkr).label("amount"),
        func.count(Transaction.id).label("count")
    ).filter(Transaction.user_id == user_id)\
     .group_by(Transaction.expense_category)\
     .order_by(func.sum(Transaction.amount_pkr).desc())\
     .all()

    spending_list = [
        {
            "category": cat or "Uncategorized", 
            "amount": float(amt),
            "count": int(cnt)
        } 
        for cat, amt, cnt in spending_by_category
    ]

    # Spending by department for current user
    spending_by_department = db.query(
        Transaction.department,
        func.sum(Transaction.amount_pkr).label("amount")
    ).filter(Transaction.user_id == user_id)\
     .group_by(Transaction.department)\
     .order_by(func.sum(Transaction.amount_pkr).desc())\
     .all()

    dept_list = [
        {
            "department": dept or "Unassigned",
            "amount": float(amt)
        }
        for dept, amt in spending_by_department
    ]

    # Risk timeline from quarterly summaries
    all_quarters = db.query(QuarterlySummary)\
        .filter(QuarterlySummary.user_id == user_id)\
        .order_by(QuarterlySummary.fiscal_year, QuarterlySummary.quarter)\
        .all()
    
    risk_timeline = [
        {
            "fiscal_year": q.fiscal_year,
            "quarter": q.quarter,
            "risk_band": q.risk_band or "Unknown",
            "predicted_band": q.predicted_band or q.risk_band,
            "confidence": float(q.confidence) if q.confidence else 0.0,
            "current_ratio": float(q.current_ratio) if q.current_ratio else 0.0,
            "debt_to_asset": float(q.debt_to_asset) if q.debt_to_asset else 0.0,
            "expense_to_revenue": float(q.expense_to_revenue) if q.expense_to_revenue else 0.0,
            "anomaly_rate": float(q.anomaly_rate) if q.anomaly_rate else 0.0
        }
        for q in all_quarters
    ]

    # Anomaly breakdown by category
    anomaly_by_category = db.query(
        Transaction.expense_category,
        func.count(Transaction.id).label("count")
    ).filter(Transaction.user_id == user_id, Transaction.is_anomaly == True)\
     .group_by(Transaction.expense_category)\
     .order_by(func.count(Transaction.id).desc())\
     .all()

    anomaly_list = [
        {
            "category": cat or "Uncategorized",
            "count": int(cnt)
        }
        for cat, cnt in anomaly_by_category
    ]

    # Approval status breakdown
    approval_stats = db.query(
        Transaction.approval_status,
        func.count(Transaction.id).label("count"),
        func.sum(Transaction.amount_pkr).label("amount")
    ).filter(Transaction.user_id == user_id)\
     .group_by(Transaction.approval_status)\
     .all()

    approval_list = [
        {
            "status": status or "Unknown",
            "count": int(cnt),
            "amount": float(amt) if amt else 0.0
        }
        for status, cnt, amt in approval_stats
    ]

    return {
        "overview": {
            "total_expense": round(total_expense, 2),
            "average_expense": round(avg_expense, 2),
            "total_transactions": total_transactions,
            "anomaly_count": anomaly_count,
            "anomaly_rate": round(anomaly_rate, 2)
        },
        "financial_ratios": {
            "current_ratio": float(latest_quarter.current_ratio) if latest_quarter and latest_quarter.current_ratio else 0.0,
            "debt_to_asset": float(latest_quarter.debt_to_asset) if latest_quarter and latest_quarter.debt_to_asset else 0.0,
            "expense_to_revenue": float(latest_quarter.expense_to_revenue) if latest_quarter and latest_quarter.expense_to_revenue else 0.0
        },
        "risk_assessment": {
            "risk_band": latest_quarter.risk_band if latest_quarter else "Unknown",
            "predicted_band": latest_quarter.predicted_band if latest_quarter else "Unknown",
            "confidence": float(latest_quarter.confidence) if latest_quarter and latest_quarter.confidence else 0.0,
            "hmm_state": latest_quarter.hmm_state if latest_quarter else "Unknown"
        },
        "spending_by_category": spending_list,
        "spending_by_department": dept_list,
        "approval_breakdown": approval_list,
        "anomaly_by_category": anomaly_list,
        "risk_timeline": risk_timeline,
        "recent_transactions": recent_txn_list
    }