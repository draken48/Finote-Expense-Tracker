from sqlalchemy.orm import Session
from datetime import datetime
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.alert import Alert
from app.models.user import User
from app.services.analytics_service import get_analytics_summary
from app.services.budget_service import get_budget_statuses
from app.services.anomaly_service import get_all_anomalies
from app.services.forecast_service import calculate_forecast
from app.services.health_score_service import calculate_financial_health_score
from typing import Dict, Any, List, Optional

class FinancialTools:
    """
    Registry of 14 grounded financial tools accessible by the AI Controller.
    """
    def __init__(self, db: Session, user_id: int = 1):
        self.db = db
        self.user_id = user_id

    def get_monthly_summary(self) -> Dict[str, Any]:
        """Returns total income, total expenses, net savings, daily burn rate, and MoM changes."""
        analytics = get_analytics_summary(self.db, user_id=self.user_id)
        return {
            "this_month_income": analytics["this_month_income"],
            "this_month_expenses": analytics["this_month_expenses"],
            "this_month_savings": analytics["this_month_savings"],
            "savings_rate_pct": analytics["savings_rate"],
            "last_month_expenses": analytics["last_month_expenses"],
            "mom_change_pct": analytics["mom_change_percentage"],
            "avg_daily_spend": analytics["avg_daily_spend"],
            "transaction_count": analytics["transaction_count"]
        }

    def get_category_spending(self, category: Optional[str] = None) -> Any:
        """Returns spending for a specific category or all categories for the current month."""
        analytics = get_analytics_summary(self.db, user_id=self.user_id)
        categories = analytics["top_categories"]
        if category:
            clean_cat = category.lower().strip()
            match = [c for c in categories if c["category"].lower() == clean_cat or clean_cat in c["category"].lower()]
            if match:
                return match[0]
            return {"category": category, "total_spent": 0.0, "percentage": 0.0, "message": f"No spending recorded in '{category}' this month."}
        return categories

    def get_budget_status(self, category: Optional[str] = None) -> Any:
        """Returns budget limit, spent amount, remaining amount, and utilization percentage."""
        statuses = get_budget_statuses(self.db, user_id=self.user_id)
        if category:
            clean_cat = category.lower().strip()
            match = [b for b in statuses if b["category"].lower() == clean_cat or clean_cat in b["category"].lower()]
            if match:
                return match[0]
            return {"category": category, "message": f"No budget found for '{category}'."}
        return statuses

    def get_transactions(self, limit: int = 10, category: Optional[str] = None, trans_type: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves recent transactions with optional category, type, and search filters."""
        query = self.db.query(Transaction).filter(Transaction.user_id == self.user_id)
        if category:
            query = query.filter(Transaction.category.ilike(f"%{category}%"))
        if trans_type:
            query = query.filter(Transaction.type == trans_type)
        if search:
            query = query.filter(Transaction.description.ilike(f"%{search}%"))
            
        txs = query.order_by(Transaction.date.desc(), Transaction.id.desc()).limit(limit).all()
        return [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.type,
                "category": t.category,
                "merchant": t.merchant or t.description,
                "description": t.description,
                "date": t.date,
                "is_anomaly": t.is_anomaly
            }
            for t in txs
        ]

    def get_transaction_details(self, transaction_id: int) -> Dict[str, Any]:
        """Fetches complete metadata for a specific transaction ID."""
        t = self.db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == self.user_id).first()
        if not t:
            return {"error": f"Transaction #{transaction_id} not found."}
        return {
            "id": t.id,
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "merchant": t.merchant,
            "description": t.description,
            "date": t.date,
            "payment_method": t.payment_method,
            "source": t.source,
            "is_anomaly": t.is_anomaly,
            "anomaly_score": t.anomaly_score,
            "anomaly_reason": t.anomaly_reason,
            "is_recurring": t.is_recurring
        }

    def get_forecast(self) -> Dict[str, Any]:
        """Returns projected monthly spending, projected month-end balance, and category overruns."""
        return calculate_forecast(self.db, user_id=self.user_id)

    def get_financial_health(self) -> Dict[str, Any]:
        """Returns the deterministic 100-point Financial Health Score, rating, positive and attention factors."""
        return calculate_financial_health_score(self.db, user_id=self.user_id)

    def get_anomalies(self) -> Dict[str, Any]:
        """Returns all flagged spending anomalies and historical statistical comparisons."""
        return get_all_anomalies(self.db, user_id=self.user_id)

    def get_recurring_expenses(self) -> List[Dict[str, Any]]:
        """Returns all detected recurring subscriptions, frequency, and projected annual burden."""
        analytics = get_analytics_summary(self.db, user_id=self.user_id)
        return analytics["recurring_expenses"]

    def get_top_merchants(self) -> List[Dict[str, Any]]:
        """Returns highest-spend merchants in the current month."""
        analytics = get_analytics_summary(self.db, user_id=self.user_id)
        return analytics["top_merchants"]

    def get_income(self) -> Dict[str, Any]:
        """Returns total income records and regular monthly income baseline."""
        user = self.db.query(User).filter(User.id == self.user_id).first()
        txs = self.db.query(Transaction).filter(Transaction.user_id == self.user_id, Transaction.type == "income").all()
        return {
            "monthly_income_baseline": user.monthly_income if user else 40000.0,
            "total_income_recorded": sum(t.amount for t in txs),
            "income_records": [{"amount": t.amount, "source": t.merchant or t.description, "date": t.date} for t in txs]
        }

    def get_expenses(self) -> Dict[str, Any]:
        """Returns total current month expenses and breakdown."""
        analytics = get_analytics_summary(self.db, user_id=self.user_id)
        return {
            "this_month_expenses": analytics["this_month_expenses"],
            "all_time_expenses": analytics["total_expenses"],
            "avg_daily_spend": analytics["avg_daily_spend"]
        }

    def create_financial_alert(self, title: str, message: str, severity: str = "medium", category: Optional[str] = None) -> Dict[str, Any]:
        """Creates a custom recommendation or advisory alert in the user's Action Center."""
        alert = Alert(
            user_id=self.user_id,
            type="recommendation",
            severity=severity,
            title=title,
            message=message,
            category=category,
            recommendation=message,
            action_type="view_category" if category else "dismiss"
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return {"status": "created", "alert_id": alert.id}


# Tool definitions metadata for LLM tool calling schema
TOOL_DEFINITIONS = [
    {
        "name": "get_monthly_summary",
        "description": "Get current month spending summary, income, savings, and MoM changes.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_category_spending",
        "description": "Get current spending breakdown by category, or query a specific category like 'Food & Dining' or 'Shopping'.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Optional category name (e.g. 'Food & Dining', 'Shopping', 'Transportation')"}
            }
        }
    },
    {
        "name": "get_budget_status",
        "description": "Get budget status, limits, spent amounts, and utilization percentages for all categories or a specific category.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Optional category name to check"}
            }
        }
    },
    {
        "name": "get_transactions",
        "description": "Search and filter recent transactions.",
        "parameters": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Number of transactions to fetch"},
                "category": {"type": "string", "description": "Filter by category"},
                "trans_type": {"type": "string", "description": "'expense' or 'income'"},
                "search": {"type": "string", "description": "Keyword search"}
            }
        }
    },
    {
        "name": "get_forecast",
        "description": "Get statistical forecasting for month-end spending, projected overrun, burn rate, and category risk levels.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_financial_health",
        "description": "Get the 100-point transparent Financial Health Score and breakdown across all 6 dimensions.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_anomalies",
        "description": "Get flagged spending anomalies and statistical deviation scores.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_recurring_expenses",
        "description": "Get all detected recurring bills, subscriptions, and projected annual expenses.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_top_merchants",
        "description": "Get the top merchant recipients of current month spending.",
        "parameters": {"type": "object", "properties": {}}
    }
]
