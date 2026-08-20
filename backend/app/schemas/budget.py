from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    category: str = Field(..., min_length=1)
    monthly_limit: float = Field(..., gt=0)
    warning_threshold: Optional[float] = Field(default=80.0, ge=1, le=100)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = Field(None, gt=0)
    warning_threshold: Optional[float] = Field(None, ge=1, le=100)

class BudgetStatus(BaseModel):
    category: str
    monthly_limit: float
    spent: float
    remaining: float
    percentage_used: float
    is_exceeded: bool
    is_warning: bool
    projected_spend: float
    projected_overrun: float

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
