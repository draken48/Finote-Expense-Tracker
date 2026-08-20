import numpy as np
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from typing import Dict, Any, List, Optional

def evaluate_transaction_anomaly(db: Session, amount: float, category: str, transaction_id: Optional[int] = None, user_id: int = 1) -> Dict[str, Any]:
    """
    Evaluates whether a transaction is an anomaly compared to historical spending in that category.
    Returns anomaly metadata: is_anomaly, score (0-100), reason, historical stats.
    """
    # Fetch historical transactions in this category (excluding the current one if updating)
    query = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.category == category,
        Transaction.type == "expense"
    )
    if transaction_id:
        query = query.filter(Transaction.id != transaction_id)
        
    history = query.all()
    
    if len(history) < 2:
        # Not enough history to declare an anomaly with statistical confidence
        return {
            "is_anomaly": False,
            "anomaly_score": 0.0,
            "anomaly_reason": f"Insufficient historical baseline in '{category}' ({len(history)} previous records).",
            "historical_mean": amount,
            "historical_median": amount,
            "historical_max": amount,
            "deviation_multiplier": 1.0,
            "status": "none"
        }
        
    amounts = [t.amount for t in history]
    mean_val = float(np.mean(amounts))
    median_val = float(np.median(amounts))
    std_val = float(np.std(amounts)) if float(np.std(amounts)) > 0 else (mean_val * 0.2 or 1.0)
    max_val = float(np.max(amounts))
    
    # Calculate Z-score and ratio over median
    z_score = (amount - mean_val) / std_val
    multiplier = amount / (median_val if median_val > 0 else mean_val or 1.0)
    
    # Check 75th percentile and IQR
    q75, q25 = np.percentile(amounts, [75, 25])
    iqr = q75 - q25
    iqr_upper_bound = q75 + 1.5 * iqr if iqr > 0 else mean_val * 2.5
    
    is_anomaly = False
    anomaly_score = 0.0
    reason = ""
    
    if amount > iqr_upper_bound and (z_score >= 2.0 or multiplier >= 2.5):
        is_anomaly = True
        # Score normalized between 60 and 100 based on severity
        raw_score = 50 + min(50, (multiplier - 2.0) * 15 + z_score * 8)
        anomaly_score = round(min(100.0, max(60.0, raw_score)), 1)
        reason = (
            f"This transaction of ₹{amount:,.2f} is {multiplier:.1f}x higher than your median "
            f"{category} spend (₹{median_val:,.2f}) and exceeds your normal range by {z_score:.1f} std deviations."
        )
    elif amount > max_val * 1.8 and len(amounts) >= 4:
        is_anomaly = True
        anomaly_score = 65.0
        reason = f"Transaction amount (₹{amount:,.2f}) is 80% higher than your previous highest record in {category} (₹{max_val:,.2f})."
        
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "anomaly_reason": reason if is_anomaly else "Within normal historical spending distribution.",
        "historical_mean": round(mean_val, 2),
        "historical_median": round(median_val, 2),
        "historical_max": round(max_val, 2),
        "deviation_multiplier": round(multiplier, 2),
        "status": "flagged" if is_anomaly else "none"
    }

def get_all_anomalies(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """
    Retrieves all flagged anomalies for the user.
    """
    anomalies = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.is_anomaly == True
    ).order_by(Transaction.date.desc()).all()
    
    items = []
    total_anomalous = 0.0
    pending_review = 0
    
    for a in anomalies:
        total_anomalous += a.amount
        if a.anomaly_status in ["flagged", "none"]:
            pending_review += 1
            
        eval_stats = evaluate_transaction_anomaly(db, a.amount, a.category, transaction_id=a.id, user_id=user_id)
        items.append({
            "transaction_id": a.id,
            "amount": a.amount,
            "category": a.category,
            "merchant": a.merchant or a.description,
            "description": a.description,
            "date": a.date,
            "anomaly_score": a.anomaly_score,
            "anomaly_reason": a.anomaly_reason or eval_stats["anomaly_reason"],
            "historical_category_mean": eval_stats["historical_mean"],
            "historical_category_median": eval_stats["historical_median"],
            "historical_category_max": eval_stats["historical_max"],
            "deviation_multiplier": eval_stats["deviation_multiplier"],
            "status": a.anomaly_status or "flagged"
        })
        
    return {
        "total_anomalies_detected": len(items),
        "pending_review_count": pending_review,
        "total_anomalous_amount": round(total_anomalous, 2),
        "anomalies": items
    }
