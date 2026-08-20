from datetime import datetime
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.user import User
from app.services.forecast_service import calculate_forecast
from typing import Dict, Any, List

def calculate_financial_health_score(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """
    Computes a deterministic, transparent 100-point Financial Health Score based on grounded transactions and budgets.
    """
    forecast_data = calculate_forecast(db, user_id=user_id)
    now = datetime.now()
    month_prefix = f"{now.year}-{now.month:02d}"
    
    # 1. Transactions & Budgets
    current_txs = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date.startswith(month_prefix)
    ).all()
    
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    expenses = [t for t in current_txs if t.type == "expense"]
    
    positive_factors: List[str] = []
    attention_factors: List[str] = []
    
    # -------------------------------------------------------------
    # DIMENSION 1: Budget Adherence (Weight: 30%)
    # -------------------------------------------------------------
    dim1_score = 100.0
    if budgets:
        over_budget_count = 0
        warning_count = 0
        for b in budgets:
            cat_spent = sum(t.amount for t in expenses if t.category == b.category)
            if cat_spent > b.monthly_limit:
                over_budget_count += 1
            elif cat_spent >= (b.monthly_limit * 0.8):
                warning_count += 1
                
        over_ratio = over_budget_count / len(budgets)
        warn_ratio = warning_count / len(budgets)
        dim1_score = max(0.0, 100.0 - (over_ratio * 70.0) - (warn_ratio * 30.0))
        
        if over_budget_count == 0 and warning_count == 0:
            positive_factors.append("All category budgets are comfortably on track.")
        elif over_budget_count > 0:
            attention_factors.append(f"{over_budget_count} category budget(s) have exceeded monthly limits.")
        elif warning_count > 0:
            attention_factors.append(f"{warning_count} category budget(s) approaching 80%+ utilization.")
    else:
        dim1_score = 80.0 # Default benchmark if budgets not yet configured
        attention_factors.append("Category budgets are not fully configured yet.")
        
    dim1_weighted = dim1_score * 0.30
    
    # -------------------------------------------------------------
    # DIMENSION 2: Savings Rate (Weight: 25%)
    # -------------------------------------------------------------
    income = forecast_data["monthly_income"]
    spent = forecast_data["current_spending"]
    current_savings = max(0.0, income - spent)
    savings_rate = (current_savings / income * 100) if income > 0 else 0.0
    
    if savings_rate >= 30.0:
        dim2_score = 100.0
        positive_factors.append(f"Strong current savings rate of {savings_rate:.1f}% (above 30% target).")
    elif savings_rate >= 20.0:
        dim2_score = 85.0
        positive_factors.append(f"Healthy savings rate of {savings_rate:.1f}% following 50/30/20 benchmark.")
    elif savings_rate >= 10.0:
        dim2_score = 65.0
        attention_factors.append(f"Moderate savings rate of {savings_rate:.1f}%; target at least 20%.")
    elif savings_rate > 0.0:
        dim2_score = 40.0
        attention_factors.append(f"Low savings buffer remaining ({savings_rate:.1f}%).")
    else:
        dim2_score = 10.0
        attention_factors.append("Current spending has matched or exceeded total monthly income.")
        
    dim2_weighted = dim2_score * 0.25
    
    # -------------------------------------------------------------
    # DIMENSION 3: Spending Volatility & Burn Rate (Weight: 15%)
    # -------------------------------------------------------------
    daily_burn = forecast_data["daily_burn_rate"]
    expected_daily_budget = (income * 0.8) / forecast_data["days_in_month"] if income > 0 else 1000.0
    
    if daily_burn <= expected_daily_budget:
        dim3_score = 95.0
        positive_factors.append(f"Daily burn rate (₹{daily_burn:,.2f}/day) is within safe budget parameters.")
    elif daily_burn <= (expected_daily_budget * 1.25):
        dim3_score = 75.0
        attention_factors.append(f"Daily burn rate is 20% higher than optimal pacing.")
    else:
        dim3_score = 45.0
        attention_factors.append(f"Elevated daily burn rate (₹{daily_burn:,.2f}/day) risks early liquidity drain.")
        
    dim3_weighted = dim3_score * 0.15
    
    # -------------------------------------------------------------
    # DIMENSION 4: Recurring Expense Load (Weight: 10%)
    # -------------------------------------------------------------
    recurring_txs = [t for t in expenses if t.is_recurring]
    recurring_total = sum(t.amount for t in recurring_txs)
    recurring_ratio = (recurring_total / income * 100) if income > 0 else 0.0
    
    if recurring_ratio <= 15.0:
        dim4_score = 100.0
        positive_factors.append(f"Low fixed commitment load ({recurring_ratio:.1f}% of income).")
    elif recurring_ratio <= 30.0:
        dim4_score = 80.0
    else:
        dim4_score = 50.0
        attention_factors.append(f"High recurring subscription/bill overhead ({recurring_ratio:.1f}% of income).")
        
    dim4_weighted = dim4_score * 0.10
    
    # -------------------------------------------------------------
    # DIMENSION 5: Anomaly Frequency (Weight: 10%)
    # -------------------------------------------------------------
    anomaly_count = sum(1 for t in expenses if t.is_anomaly and t.anomaly_status != "dismissed")
    if anomaly_count == 0:
        dim5_score = 100.0
        positive_factors.append("Zero unreviewed spending anomalies detected this month.")
    elif anomaly_count == 1:
        dim5_score = 75.0
        attention_factors.append("1 unusual spending transaction detected requiring review.")
    else:
        dim5_score = max(20.0, 100.0 - (anomaly_count * 30.0))
        attention_factors.append(f"{anomaly_count} spending anomalies detected in current period.")
        
    dim5_weighted = dim5_score * 0.10
    
    # -------------------------------------------------------------
    # DIMENSION 6: Forecasted Overrun Risk (Weight: 10%)
    # -------------------------------------------------------------
    projected_overrun = forecast_data["projected_overspend"]
    if projected_overrun <= 0.0:
        dim6_score = 100.0
        positive_factors.append(f"Projected month-end surplus of ₹{forecast_data['projected_savings']:,.2f}.")
    elif projected_overrun < (income * 0.10):
        dim6_score = 60.0
        attention_factors.append(f"Minor projected month-end overspend of ₹{projected_overrun:,.2f}.")
    else:
        dim6_score = 25.0
        attention_factors.append(f"Critical projected deficit of ₹{projected_overrun:,.2f} by month-end.")
        
    dim6_weighted = dim6_score * 0.10
    
    # -------------------------------------------------------------
    # OVERALL COMPOSITE SCORE (0 to 100)
    # -------------------------------------------------------------
    raw_total = dim1_weighted + dim2_weighted + dim3_weighted + dim4_weighted + dim5_weighted + dim6_weighted
    overall_score = int(round(min(100.0, max(0.0, raw_total))))
    
    if overall_score >= 85:
        rating_label = "Excellent"
        key_rec = "Your financial discipline is exceptional. Consider channeling extra surplus into investments."
    elif overall_score >= 70:
        rating_label = "Good"
        key_rec = "Finances are in solid standing. Watch out for discretionary categories near threshold."
    elif overall_score >= 50:
        rating_label = "Fair"
        key_rec = "Moderate risk of budget overrun. Reduce non-essential shopping and dining out."
    elif overall_score >= 35:
        rating_label = "At Risk"
        key_rec = "High daily spending burn detected. Implement immediate spending caps on top categories."
    else:
        rating_label = "Critical"
        key_rec = "Severe cashflow deficit projected. Halt non-essential transactions immediately."
        
    dimensions = [
        {"name": "Budget Adherence", "score": round(dim1_score, 1), "weight": 0.30, "weighted_score": round(dim1_weighted, 1), "status": "excellent" if dim1_score >= 80 else ("good" if dim1_score >= 60 else "warning"), "details": f"{dim1_score:.0f}/100 based on category limits"},
        {"name": "Savings Rate", "score": round(dim2_score, 1), "weight": 0.25, "weighted_score": round(dim2_weighted, 1), "status": "excellent" if dim2_score >= 80 else ("good" if dim2_score >= 60 else "warning"), "details": f"{savings_rate:.1f}% savings rate vs benchmark"},
        {"name": "Spending Volatility", "score": round(dim3_score, 1), "weight": 0.15, "weighted_score": round(dim3_weighted, 1), "status": "excellent" if dim3_score >= 80 else ("good" if dim3_score >= 60 else "warning"), "details": f"₹{daily_burn:,.2f}/day burn rate"},
        {"name": "Recurring Load", "score": round(dim4_score, 1), "weight": 0.10, "weighted_score": round(dim4_weighted, 1), "status": "excellent" if dim4_score >= 80 else "good", "details": f"{recurring_ratio:.1f}% committed to fixed costs"},
        {"name": "Anomaly Index", "score": round(dim5_score, 1), "weight": 0.10, "weighted_score": round(dim5_weighted, 1), "status": "excellent" if dim5_score >= 80 else "warning", "details": f"{anomaly_count} unreviewed anomalies"},
        {"name": "Forecast Buffer", "score": round(dim6_score, 1), "weight": 0.10, "weighted_score": round(dim6_weighted, 1), "status": "excellent" if dim6_score >= 80 else ("good" if dim6_score >= 60 else "critical"), "details": f"₹{forecast_data['projected_month_end_balance']:,.2f} projected net"}
    ]
    
    return {
        "overall_score": overall_score,
        "rating_label": rating_label,
        "positive_factors": positive_factors[:4],
        "attention_factors": attention_factors[:4],
        "dimensions": dimensions,
        "key_recommendation": key_rec,
        "reproducible_breakdown": {
            "budget_adherence_weighted": round(dim1_weighted, 1),
            "savings_rate_weighted": round(dim2_weighted, 1),
            "volatility_weighted": round(dim3_weighted, 1),
            "recurring_weighted": round(dim4_weighted, 1),
            "anomaly_weighted": round(dim5_weighted, 1),
            "forecast_weighted": round(dim6_weighted, 1)
        }
    }
