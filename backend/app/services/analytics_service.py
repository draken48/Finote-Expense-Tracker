from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.user import User
from typing import Dict, Any, List

CATEGORY_COLORS = {
    "Food & Dining": "#FF6384",
    "Shopping": "#FFCE56",
    "Transportation": "#36A2EB",
    "Entertainment": "#4BC0C0",
    "Bills & Utilities": "#9966FF",
    "Healthcare": "#FF9F40",
    "Education": "#FF6384",
    "Investments": "#10B981",
    "Income": "#3B82F6",
    "Others": "#9CA3AF"
}

CATEGORY_ICONS = {
    "Food & Dining": "🍔",
    "Shopping": "🛍️",
    "Transportation": "🚗",
    "Entertainment": "🎬",
    "Bills & Utilities": "💡",
    "Healthcare": "🏥",
    "Education": "📚",
    "Investments": "📈",
    "Income": "💰",
    "Others": "📦"
}

def get_analytics_summary(db: Session, user_id: int = 1) -> Dict[str, Any]:
    now = datetime.now()
    this_month_prefix = f"{now.year}-{now.month:02d}"
    
    last_month_date = (now.replace(day=1) - timedelta(days=1))
    last_month_prefix = f"{last_month_date.year}-{last_month_date.month:02d}"
    
    all_transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    user = db.query(User).filter(User.id == user_id).first()
    
    total_income = sum(t.amount for t in all_transactions if t.type == "income")
    total_expenses = sum(t.amount for t in all_transactions if t.type == "expense")
    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0
    
    # This month
    this_month_tx = [t for t in all_transactions if t.date.startswith(this_month_prefix)]
    this_month_income = sum(t.amount for t in this_month_tx if t.type == "income")
    if this_month_income == 0 and user and user.monthly_income:
        this_month_income = user.monthly_income
        
    this_month_expenses = sum(t.amount for t in this_month_tx if t.type == "expense")
    this_month_savings = max(0.0, this_month_income - this_month_expenses)
    
    # Last month
    last_month_tx = [t for t in all_transactions if t.date.startswith(last_month_prefix)]
    last_month_expenses = sum(t.amount for t in last_month_tx if t.type == "expense")
    
    mom_change = 0.0
    if last_month_expenses > 0:
        mom_change = ((this_month_expenses - last_month_expenses) / last_month_expenses) * 100
        
    active_days = max(1, now.day)
    avg_daily_spend = this_month_expenses / active_days
    
    # Category spending breakdown for this month
    budgets = {b.category: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == user_id).all()}
    cat_totals: Dict[str, Dict[str, Any]] = {}
    for t in this_month_tx:
        if t.type == "expense":
            if t.category not in cat_totals:
                cat_totals[t.category] = {"total": 0.0, "count": 0}
            cat_totals[t.category]["total"] += t.amount
            cat_totals[t.category]["count"] += 1
            
    top_categories = []
    for cat, data in sorted(cat_totals.items(), key=lambda x: x[1]["total"], reverse=True):
        pct = (data["total"] / this_month_expenses * 100) if this_month_expenses > 0 else 0.0
        top_categories.append({
            "category": cat,
            "total_spent": round(data["total"], 2),
            "percentage": round(pct, 1),
            "transaction_count": data["count"],
            "budget_limit": budgets.get(cat),
            "icon": CATEGORY_ICONS.get(cat, "📦"),
            "color": CATEGORY_COLORS.get(cat, "#9CA3AF")
        })
        
    # Top merchants for this month
    merchant_totals: Dict[str, Dict[str, Any]] = {}
    for t in this_month_tx:
        if t.type == "expense":
            m_name = t.merchant or t.description.split()[0].capitalize()
            if m_name not in merchant_totals:
                merchant_totals[m_name] = {"total": 0.0, "count": 0, "category": t.category}
            merchant_totals[m_name]["total"] += t.amount
            merchant_totals[m_name]["count"] += 1
            
    top_merchants = []
    for m, data in sorted(merchant_totals.items(), key=lambda x: x[1]["total"], reverse=True)[:6]:
        top_merchants.append({
            "merchant": m,
            "total_spent": round(data["total"], 2),
            "transaction_count": data["count"],
            "category": data["category"]
        })
        
    # Monthly trend (last 6 months)
    monthly_data: Dict[str, Dict[str, float]] = {}
    for t in all_transactions:
        m_key = t.date[:7] # YYYY-MM
        if m_key not in monthly_data:
            monthly_data[m_key] = {"income": 0.0, "expense": 0.0}
        if t.type == "income":
            monthly_data[m_key]["income"] += t.amount
        else:
            monthly_data[m_key]["expense"] += t.amount
            
    monthly_trends = []
    for m_key in sorted(monthly_data.keys())[-6:]:
        inc = monthly_data[m_key]["income"]
        exp = monthly_data[m_key]["expense"]
        sav = inc - exp
        s_rate = (sav / inc * 100) if inc > 0 else 0.0
        monthly_trends.append({
            "month": m_key,
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "savings": round(sav, 2),
            "savings_rate": round(s_rate, 1)
        })
        
    # Daily spending (last 14 days)
    daily_map: Dict[str, Dict[str, Any]] = {}
    for i in range(14):
        d_str = (now - timedelta(days=13 - i)).strftime("%Y-%m-%d")
        daily_map[d_str] = {"date": d_str, "amount": 0.0, "count": 0}
        
    for t in all_transactions:
        if t.type == "expense" and t.date in daily_map:
            daily_map[t.date]["amount"] += t.amount
            daily_map[t.date]["count"] += 1
            
    daily_spending = list(daily_map.values())
    for d in daily_spending:
        d["amount"] = round(d["amount"], 2)
        
    # Recurring expenses
    recurring_map: Dict[str, Dict[str, Any]] = {}
    for t in all_transactions:
        if t.is_recurring and t.type == "expense":
            key = (t.merchant or t.description).lower()
            if key not in recurring_map:
                recurring_map[key] = {
                    "merchant": t.merchant or t.description,
                    "description": t.description,
                    "category": t.category,
                    "amount": t.amount,
                    "frequency": t.recurring_interval or "monthly",
                    "count": 0,
                    "last_date": t.date,
                    "projected_annual_cost": t.amount * (12 if (t.recurring_interval or "monthly") == "monthly" else 52)
                }
            recurring_map[key]["count"] += 1
            if t.date > recurring_map[key]["last_date"]:
                recurring_map[key]["last_date"] = t.date
                
    recurring_expenses = list(recurring_map.values())
    
    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": round(savings_rate, 1),
        "this_month_income": round(this_month_income, 2),
        "this_month_expenses": round(this_month_expenses, 2),
        "this_month_savings": round(this_month_savings, 2),
        "last_month_expenses": round(last_month_expenses, 2),
        "mom_change_percentage": round(mom_change, 1),
        "avg_daily_spend": round(avg_daily_spend, 2),
        "active_days": active_days,
        "transaction_count": len(this_month_tx),
        "top_categories": top_categories,
        "top_merchants": top_merchants,
        "monthly_trends": monthly_trends,
        "daily_spending": daily_spending,
        "recurring_expenses": recurring_expenses
    }
