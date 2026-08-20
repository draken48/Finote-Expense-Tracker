from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class ReceiptRecord(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    merchant = Column(String(100), nullable=True)
    amount = Column(Float, nullable=True)
    tax = Column(Float, nullable=True)
    date = Column(String(20), nullable=True)
    category = Column(String(50), nullable=True)
    payment_method = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=True)
    line_items_json = Column(Text, nullable=True) # JSON array of {description, amount, qty}
    confidence_score = Column(Float, default=0.0)
    status = Column(String(20), default="processed") # processed, confirmed, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
