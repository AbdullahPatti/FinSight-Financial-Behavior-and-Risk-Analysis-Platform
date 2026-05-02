from sqlalchemy import Column, Integer, String, Float
from db import Base

class QuarterlySummary(Base):
    __tablename__ = "quarterly_summary"
    id = Column(Integer, primary_key=True, index=True)
    fiscal_year = Column(String, index=True)
    quarter = Column(String, index=True)
    current_ratio = Column(Float)
    debt_to_asset = Column(Float)
    expense_to_revenue = Column(Float)
    anomaly_rate = Column(Float)
    quarterly_revenue = Column(Float)
    long_term_loans = Column(Float)
    hmm_state = Column(String)
    risk_band = Column(String)
    predicted_band = Column(String)
    confidence = Column(Float)
    user_id = Column(Integer, index=True)