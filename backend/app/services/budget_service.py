from datetime import datetime
from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.models.transaction import Transaction
from typing import List, Dict, Any, Optional

DEFAULT_CATEGORIES = [
    {"category": "Food & Dining", "limit": 6000.0, "icon": "🍔"},
    {"category": "Shopping", "limit": 5000.0, "icon": "🛍️"},
    {"category": "Transportation", "limit": 3000.0, "icon": "🚗"},
    {"category": "Entertainment", "limit": 2500.0, "icon": "🎬"},
    {"category": "Bills & Utilities", "limit": 8000.0, "icon": "💡"},
    {"category": "Healthcare", "limit": 3000.0, "icon": "🏥"},
    {"category": "Education", "limit": 2000.0, "icon": "📚"},
    {"category": "Investments", "limit": 5000.0, "icon": "📈"},
    {"category": "Others", "limit": 2000.0, "icon": "📦"}
]

def init_default_budgets(db: Session, user_id: int = 1):
    existing = db.query(Budget).filter(Budget.user_id == user_id).first()
    if not existing:
        for item in DEFAULT_CATEGORIES:
            b = Budget(
                user_id=user_id,
                category=item["category"],
                monthly_limit=item["limit"],
                warning_threshold=80.0
            )
            db.add(b)
        db.commit()

def get_budget_statuses(db: Session, user_id: int = 1) -> List[Dict[str, Any]]:
    init_default_budgets(db, user_id)
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    
    now = datetime.now()
    month_prefix = f"{now.year}-{now.month:02d}"
    days_in_month = 30
    days_elapsed = max(1, now.day)
    
    # Query current month expenses grouped by category
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date.startswith(month_prefix)
    ).all()
    
    cat_spent: Dict[str, float] = {}
    for t in transactions:
        cat_spent[t.category] = cat_spent.get(t.category, 0.0) + t.amount
        
    results = []
    for b in budgets:
        spent = cat_spent.get(b.category, 0.0)
        remaining = b.monthly_limit - spent
        pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0.0
        
        # Projected spending for this category
        daily_rate = spent / days_elapsed
        projected = spent + (daily_rate * (days_in_month - days_elapsed))
        projected_overrun = max(0.0, projected - b.monthly_limit)
        
        results.append({
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "percentage_used": round(pct, 1),
            "is_exceeded": spent > b.monthly_limit,
            "is_warning": pct >= b.warning_threshold and spent <= b.monthly_limit,
            "projected_spend": round(projected, 2),
            "projected_overrun": round(projected_overrun, 2)
        })
        
    return results

def set_or_update_budget(db: Session, category: str, monthly_limit: float, warning_threshold: float = 80.0, user_id: int = 1) -> Budget:
    budget = db.query(Budget).filter(Budget.user_id == user_id, Budget.category == category).first()
    if budget:
        budget.monthly_limit = monthly_limit
        budget.warning_threshold = warning_threshold
    else:
        budget = Budget(
            user_id=user_id,
            category=category,
            monthly_limit=monthly_limit,
            warning_threshold=warning_threshold
        )
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget
