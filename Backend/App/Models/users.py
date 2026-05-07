from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from App.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    plan = Column(String, default="Free")
    created_at = Column(DateTime, server_default=func.now())