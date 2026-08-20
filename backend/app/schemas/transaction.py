from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount")
    type: str = Field(default="expense", description="Transaction type: 'expense' or 'income'")
    category: str = Field(..., min_length=1, description="Category name")
    merchant: Optional[str] = Field(None, description="Merchant name")
    description: str = Field(..., min_length=1, description="Transaction description")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    payment_method: Optional[str] = Field(default="UPI", description="Payment method")
    source: Optional[str] = Field(default="manual", description="Source: manual, receipt, voice, demo, etc.")
    is_recurring: Optional[bool] = Field(default=False)
    recurring_interval: Optional[str] = Field(default=None)
    tags: Optional[str] = Field(default=None)
    mood: Optional[str] = Field(default=None)
    receipt_id: Optional[int] = Field(default=None)

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[str] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None
    source: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurring_interval: Optional[str] = None
    tags: Optional[str] = None
    mood: Optional[str] = None
    anomaly_status: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    is_anomaly: bool
    anomaly_score: float
    anomaly_reason: Optional[str] = None
    anomaly_status: str
    confidence_score: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AutoCategorizeRequest(BaseModel):
    description: str
    amount: Optional[float] = None
    merchant: Optional[str] = None

class AutoCategorizeResponse(BaseModel):
    merchant: str
    category: str
    type: str
    confidence: float
    reason: str
