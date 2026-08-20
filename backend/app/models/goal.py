from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    name = Column(String(100), nullable=False)
    target = Column(Float, nullable=False)
    current = Column(Float, default=0.0)
    deadline = Column(String(20), nullable=True) # YYYY-MM-DD
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
