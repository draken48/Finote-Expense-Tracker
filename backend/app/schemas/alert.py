from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AlertBase(BaseModel):
    type: str # budget_risk, spending_anomaly, forecast_warning, recurring_due, recommendation
    severity: str = "medium" # low, medium, high, critical
    title: str
    message: str
    category: Optional[str] = None
    recommendation: Optional[str] = None
    action_type: Optional[str] = None
    action_payload: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    user_id: int
    is_read: bool
    is_dismissed: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ActionCenterSummary(BaseModel):
    total_active_alerts: int
    critical_count: int
    budget_risks_count: int
    anomalies_count: int
    forecast_warnings_count: int
    recommendations_count: int
    alerts: List[AlertResponse]
