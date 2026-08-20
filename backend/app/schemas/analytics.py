from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class CategorySpending(BaseModel):
    category: str
    total_spent: float
    percentage: float
    transaction_count: int
    budget_limit: Optional[float] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class MerchantSpending(BaseModel):
    merchant: str
    total_spent: float
    transaction_count: int
    category: str

class DailySpending(BaseModel):
    date: str
    amount: float
    count: int

class MonthlyTrend(BaseModel):
    month: str # YYYY-MM
    income: float
    expense: float
    savings: float
    savings_rate: float

class RecurringExpense(BaseModel):
    merchant: str
    description: str
    category: str
    amount: float
    frequency: str
    count: int
    last_date: str
    projected_annual_cost: float

class AnalyticsSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate: float
    this_month_income: float
    this_month_expenses: float
    this_month_savings: float
    last_month_expenses: float
    mom_change_percentage: float
    avg_daily_spend: float
    active_days: int
    transaction_count: int
    top_categories: List[CategorySpending]
    top_merchants: List[MerchantSpending]
    monthly_trends: List[MonthlyTrend]
    daily_spending: List[DailySpending]
    recurring_expenses: List[RecurringExpense]
