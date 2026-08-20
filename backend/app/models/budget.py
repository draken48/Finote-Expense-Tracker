from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    category = Column(String(50), nullable=False, index=True)
    monthly_limit = Column(Float, nullable=False)
    warning_threshold = Column(Float, default=80.0) # Percentage (e.g., 80%)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
