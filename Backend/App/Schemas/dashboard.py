from pydantic import BaseModel
from typing import List, Dict

class SpendingByCategory(BaseModel):
    category: str
    amount: float

class RiskTimeline(BaseModel):
    fiscal_year: str
    quarter: str
    risk_band: str
    confidence: float

class DashboardResponse(BaseModel):
    current_ratio: float
    debt_ratio: float
    risk_band: str
    total_expense: float
    anomaly_count: int
    active_users: int
    spending_by_category: List[Dict]
    risk_timeline: List[RiskTimeline]
    recent_transactions: List[dict]