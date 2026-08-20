from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class LineItem(BaseModel):
    description: str
    amount: float
    quantity: Optional[int] = 1

class ReceiptAnalysisResponse(BaseModel):
    receipt_id: Optional[int] = None
    merchant: str
    amount: float
    tax: Optional[float] = 0.0
    date: str
    category: str
    payment_method: str
    confidence_score: float
    line_items: List[LineItem] = []
    raw_text: Optional[str] = None
    status: str = "success"
    message: Optional[str] = None

class ReceiptConfirmRequest(BaseModel):
    merchant: str
    amount: float
    category: str
    date: str
    description: Optional[str] = None
    payment_method: Optional[str] = "UPI"
    tags: Optional[str] = "receipt"
    receipt_id: Optional[int] = None
