import calendar
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.user import User
from typing import Dict, Any, List

def calculate_forecast(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """
    Calculates statistical month-end financial projections based on grounded transactions and budgets.
    """
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    current_day = now.day
    
    # Days in current month
    days_in_month = calendar.monthrange(current_year, current_month)[1]
    days_elapsed = max(1, current_day)
    days_remaining = max(0, days_in_month - days_elapsed)
    
    # Month prefix for queries
    month_prefix = f"{current_year}-{current_month:02d}"
    
    # Fetch user details
    user = db.query(User).filter(User.id == user_id).first()
    monthly_income = user.monthly_income if user else 40000.0
    
    # Fetch current month expenses
    current_month_transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date.startswith(month_prefix)
    ).all()
    
    current_income = sum(t.amount for t in current_month_transactions if t.type == "income")
    effective_income = current_income if current_income > 0 else monthly_income
    
    expenses_list = [t for t in current_month_transactions if t.type == "expense"]
    current_spending = sum(t.amount for t in expenses_list)
    
    # Check all transactions count
    total_tx_count = db.query(Transaction).filter(Transaction.user_id == user_id).count()
    has_sufficient_data = len(expenses_list) >= 3 or total_tx_count >= 10
    
    # Daily burn rate (weighted towards recent activity)
    daily_burn_rate = current_spending / days_elapsed
    
    # Fetch recurring commitments due in remaining days
    recurring_txs = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.is_recurring == True,
        Transaction.type == "expense"
    ).all()
    
    # Simple recurring projection
    projected_monthly_spending = current_spending + (daily_burn_rate * days_remaining)
    projected_month_end_balance = effective_income - projected_monthly_spending
    projected_overspend = max(0.0, projected_monthly_spending - effective_income)
    projected_savings = max(0.0, effective_income - projected_monthly_spending)
    projected_savings_rate = (projected_savings / effective_income * 100) if effective_income > 0 else 0.0
    
    # Category-level projections & budget risks
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    budget_map = {b.category: b.monthly_limit for b in budgets}
    
    cat_spending: Dict[str, float] = {}
    for t in expenses_list:
        cat_spending[t.category] = cat_spending.get(t.category, 0.0) + t.amount
        
    category_forecasts: List[Dict[str, Any]] = []
    top_risk_categories: List[str] = []
    
    all_categories = set(list(budget_map.keys()) + list(cat_spending.keys()))
    for cat in sorted(all_categories):
        spent = cat_spending.get(cat, 0.0)
        budget = budget_map.get(cat, 0.0)
        cat_daily_burn = spent / days_elapsed
        cat_projected = spent + (cat_daily_burn * days_remaining)
        cat_overrun = max(0.0, cat_projected - budget) if budget > 0 else 0.0
        
        # Risk assessment
        if budget > 0:
            utilization = (spent / budget) * 100
            projected_utilization = (cat_projected / budget) * 100
            if projected_utilization > 115 or utilization >= 100:
                risk_level = "critical"
                top_risk_categories.append(cat)
            elif projected_utilization > 95 or utilization >= 80:
                risk_level = "high"
                top_risk_categories.append(cat)
            elif projected_utilization > 75:
                risk_level = "medium"
            else:
                risk_level = "low"
        else:
            risk_level = "medium" if cat_projected > (effective_income * 0.2) else "low"
            
        category_forecasts.append({
            "category": cat,
            "current_spent": round(spent, 2),
            "monthly_budget": round(budget, 2),
            "projected_spend": round(cat_projected, 2),
            "projected_overrun": round(cat_overrun, 2),
            "risk_level": risk_level
        })
        
    confidence = "High" if len(expenses_list) >= 15 else ("Moderate" if len(expenses_list) >= 5 else "Preliminary")
    methodology = (
        f"Grounded Linear Daily Burn Rate model calculated across {days_elapsed} active days "
        f"(₹{daily_burn_rate:,.2f}/day) projected over {days_remaining} remaining days of {now.strftime('%B %Y')}."
    )
    
    return {
        "monthly_income": round(effective_income, 2),
        "current_spending": round(current_spending, 2),
        "days_elapsed": days_elapsed,
        "days_in_month": days_in_month,
        "daily_burn_rate": round(daily_burn_rate, 2),
        "projected_monthly_spending": round(projected_monthly_spending, 2),
        "projected_month_end_balance": round(projected_month_end_balance, 2),
        "projected_overspend": round(projected_overspend, 2),
        "projected_savings": round(projected_savings, 2),
        "projected_savings_rate": round(projected_savings_rate, 1),
        "confidence_level": confidence,
        "methodology": methodology,
        "has_sufficient_data": has_sufficient_data,
        "category_forecasts": category_forecasts,
        "top_risk_categories": top_risk_categories
    }
