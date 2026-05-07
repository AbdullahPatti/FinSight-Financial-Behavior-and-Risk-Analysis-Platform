from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from App.db import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    date = Column(Date, index=True)
    fiscal_year = Column(String, index=True)
    quarter = Column(String, index=True)
    department = Column(String)
    expense_category = Column(String, index=True)
    vendor_name = Column(String)
    transaction_description = Column(String)
    amount_pkr = Column(Float)
    payment_method = Column(String)
    approval_status = Column(String)
    hmm_state = Column(String)
    is_anomaly = Column(Boolean, default=False)
    review_tier = Column(String)
    predicted_category = Column(String)
    user_id = Column(Integer, index=True)