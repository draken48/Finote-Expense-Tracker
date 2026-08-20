from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    type = Column(String(50), nullable=False) # budget_risk, spending_anomaly, forecast_warning, recurring_due, recommendation
    severity = Column(String(20), default="medium") # low, medium, high, critical
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    recommendation = Column(Text, nullable=True)
    action_type = Column(String(50), nullable=True) # review_transaction, adjust_budget, dismiss, view_category
    action_payload = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
