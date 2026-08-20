from sqlalchemy.orm import Session
from datetime import datetime
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.alert import Alert
from app.models.user import User
from app.services.anomaly_service import evaluate_transaction_anomaly
from app.services.forecast_service import calculate_forecast
from app.services.health_score_service import calculate_financial_health_score
from typing import Dict, Any, List, Optional

def process_transaction_event(db: Session, transaction: Transaction, user_id: int = 1) -> Dict[str, Any]:
    """
    Core Finance Controller Event Loop:
    Observe → Understand → Detect → Predict → Recommend → Act
    """
    alerts_generated = []
    
    # 1. Anomaly Evaluation
    if transaction.type == "expense":
        anomaly_result = evaluate_transaction_anomaly(
            db, 
            amount=transaction.amount, 
            category=transaction.category, 
            transaction_id=transaction.id, 
            user_id=user_id
        )
        
        transaction.is_anomaly = anomaly_result["is_anomaly"]
        transaction.anomaly_score = anomaly_result["anomaly_score"]
        transaction.anomaly_reason = anomaly_result["anomaly_reason"]
        transaction.anomaly_status = anomaly_result["status"]
        
        if anomaly_result["is_anomaly"]:
            alert = Alert(
                user_id=user_id,
                type="spending_anomaly",
                severity="high",
                title=f"🚨 Unusual {transaction.category} Transaction Detected",
                message=(
                    f"A transaction of ₹{transaction.amount:,.2f} at {transaction.merchant or transaction.description} "
                    f"is {anomaly_result['deviation_multiplier']}x higher than your typical {transaction.category} spend."
                ),
                category=transaction.category,
                recommendation=f"Review this transaction to confirm if it was intentional or needs to be tagged as a one-time outlier.",
                action_type="review_transaction",
                action_payload=str(transaction.id)
            )
            db.add(alert)
            alerts_generated.append(alert)

    # 2. Budget Evaluation
    if transaction.type == "expense":
        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category == transaction.category
        ).first()
        
        if budget:
            now = datetime.now()
            month_prefix = f"{now.year}-{now.month:02d}"
            
            # Calculate total category spent this month
            current_month_spent = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.category == transaction.category,
                Transaction.type == "expense",
                Transaction.date.startswith(month_prefix)
            ).all()
            
            total_spent = sum(t.amount for t in current_month_spent)
            utilization = (total_spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0.0
            
            if total_spent > budget.monthly_limit:
                over_by = total_spent - budget.monthly_limit
                alert = Alert(
                    user_id=user_id,
                    type="budget_risk",
                    severity="critical",
                    title=f"⚠️ {transaction.category} Budget Exceeded",
                    message=(
                        f"This transaction brings your {transaction.category} spending to ₹{total_spent:,.2f}, "
                        f"exceeding your monthly limit of ₹{budget.monthly_limit:,.2f} by ₹{over_by:,.2f} ({utilization:.1f}% used)."
                    ),
                    category=transaction.category,
                    recommendation=f"Halt non-essential {transaction.category} expenses for the rest of the month or increase budget allocation.",
                    action_type="adjust_budget",
                    action_payload=transaction.category
                )
                db.add(alert)
                alerts_generated.append(alert)
                
            elif utilization >= budget.warning_threshold:
                remaining = budget.monthly_limit - total_spent
                alert = Alert(
                    user_id=user_id,
                    type="budget_risk",
                    severity="medium",
                    title=f"⚡ {transaction.category} Budget Threshold Reached ({utilization:.0f}%)",
                    message=(
                        f"You have used {utilization:.1f}% of your {transaction.category} budget. "
                        f"Only ₹{remaining:,.2f} remains for the rest of the month."
                    ),
                    category=transaction.category,
                    recommendation=f"Pace your remaining discretionary {transaction.category} spending to stay within limit.",
                    action_type="view_category",
                    action_payload=transaction.category
                )
                db.add(alert)
                alerts_generated.append(alert)

    # 3. Forecast & Health Score Check
    forecast = calculate_forecast(db, user_id=user_id)
    if forecast["projected_overspend"] > 0 and len(alerts_generated) == 0:
        # Check if forecast alert already exists for today
        existing_alert = db.query(Alert).filter(
            Alert.user_id == user_id,
            Alert.type == "forecast_warning",
            Alert.is_dismissed == False
        ).first()
        
        if not existing_alert:
            alert = Alert(
                user_id=user_id,
                type="forecast_warning",
                severity="high",
                title="📉 Projected Month-End Overspending Risk",
                message=(
                    f"Based on your current daily burn rate (₹{forecast['daily_burn_rate']:,.2f}/day), "
                    f"your projected spending is ₹{forecast['projected_monthly_spending']:,.2f}, "
                    f"which exceeds monthly income by ₹{forecast['projected_overspend']:,.2f}."
                ),
                category="Overall",
                recommendation=f"Top risk categories: {', '.join(forecast['top_risk_categories'] or ['Discretionary'])}. Reduce discretionary spend by ~15%.",
                action_type="view_forecast",
                action_payload="forecast"
            )
            db.add(alert)
            alerts_generated.append(alert)

    db.commit()
    
    return {
        "status": "success",
        "alerts_created": len(alerts_generated),
        "is_anomaly": transaction.is_anomaly,
        "anomaly_score": transaction.anomaly_score
    }

def get_action_center_summary(db: Session, user_id: int = 1) -> Dict[str, Any]:
    alerts = db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.is_dismissed == False
    ).order_by(Alert.created_at.desc()).all()
    
    critical_count = sum(1 for a in alerts if a.severity in ["critical", "high"])
    budget_risks = sum(1 for a in alerts if a.type == "budget_risk")
    anomalies = sum(1 for a in alerts if a.type == "spending_anomaly")
    forecast_warnings = sum(1 for a in alerts if a.type == "forecast_warning")
    recommendations = sum(1 for a in alerts if a.type == "recommendation")
    
    return {
        "total_active_alerts": len(alerts),
        "critical_count": critical_count,
        "budget_risks_count": budget_risks,
        "anomalies_count": anomalies,
        "forecast_warnings_count": forecast_warnings,
        "recommendations_count": recommendations,
        "alerts": alerts
    }
