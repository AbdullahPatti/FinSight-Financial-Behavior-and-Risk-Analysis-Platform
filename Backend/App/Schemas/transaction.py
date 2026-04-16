from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionResponse(BaseModel):
    transaction_id: str
    date: date
    department: Optional[str]
    expense_category: Optional[str]
    amount_pkr: float
    payment_method: Optional[str]
    approval_status: Optional[str]
    hmm_state: Optional[str]
    is_anomaly: bool
    review_tier: Optional[str]
    predicted_category: Optional[str]

    class Config:
        from_attributes = True