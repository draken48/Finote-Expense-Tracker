from pydantic import BaseModel
from typing import List, Dict, Optional

class CategoryForecast(BaseModel):
    category: str
    current_spent: float
    monthly_budget: float
    projected_spend: float
    projected_overrun: float
    risk_level: str # low, medium, high, critical

class ForecastResponse(BaseModel):
    monthly_income: float
    current_spending: float
    days_elapsed: int
    days_in_month: int
    daily_burn_rate: float
    projected_monthly_spending: float
    projected_month_end_balance: float
    projected_overspend: float
    projected_savings: float
    projected_savings_rate: float
    confidence_level: str # High, Moderate, Preliminary
    methodology: str
    has_sufficient_data: bool
    category_forecasts: List[CategoryForecast]
    top_risk_categories: List[str]
