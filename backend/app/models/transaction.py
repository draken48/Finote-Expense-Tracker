from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False, default="expense") # "expense" or "income"
    category = Column(String(50), nullable=False, index=True)
    merchant = Column(String(100), nullable=True, index=True)
    description = Column(String(255), nullable=False)
    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    payment_method = Column(String(50), default="UPI") # UPI, Credit Card, Debit Card, Net Banking, Cash
    source = Column(String(50), default="manual") # manual, receipt, voice, demo, import
    
    # Anomaly fields
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0) # 0 to 100
    anomaly_reason = Column(String(255), nullable=True)
    anomaly_status = Column(String(20), default="none") # none, flagged, verified, dismissed
    
    # Recurring metadata
    is_recurring = Column(Boolean, default=False)
    recurring_interval = Column(String(20), nullable=True) # daily, weekly, monthly, yearly
    
    # Additional context
    tags = Column(String(255), nullable=True) # Comma-separated or JSON
    mood = Column(String(20), nullable=True)
    confidence_score = Column(Float, default=1.0) # Categorization confidence
    
    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
