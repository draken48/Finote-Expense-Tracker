from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.alert import Alert
from app.models.goal import Goal
from app.services.controller_service import process_transaction_event

def seed_demo_data(db: Session, user_id: int = 1) -> dict:
    """
    Seeds rich, realistic synthetic financial data for the Finote AI demo scenario.
    Demonstrates: income tracking, category budgets, recurring subscriptions, anomaly detection,
    spend forecasting, and the full controller loop.
    """
    # 1. Clear existing user data
    db.query(Alert).filter(Alert.user_id == user_id).delete()
    db.query(Transaction).filter(Transaction.user_id == user_id).delete()
    db.query(Budget).filter(Budget.user_id == user_id).delete()
    db.query(Goal).filter(Goal.user_id == user_id).delete()
    
    # 2. Setup User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email="demo@finote.ai", name="Finote Demo User", monthly_income=40000.0, currency="INR")
        db.add(user)
    else:
        user.monthly_income = 40000.0
        user.currency = "INR"
    db.commit()

    # 3. Setup Budgets
    budgets = [
        Budget(user_id=user_id, category="Food & Dining", monthly_limit=6000.0, warning_threshold=80.0),
        Budget(user_id=user_id, category="Shopping", monthly_limit=5000.0, warning_threshold=80.0),
        Budget(user_id=user_id, category="Bills & Utilities", monthly_limit=8000.0, warning_threshold=85.0),
        Budget(user_id=user_id, category="Transportation", monthly_limit=3000.0, warning_threshold=80.0),
        Budget(user_id=user_id, category="Entertainment", monthly_limit=2500.0, warning_threshold=80.0),
        Budget(user_id=user_id, category="Healthcare", monthly_limit=3000.0, warning_threshold=80.0),
        Budget(user_id=user_id, category="Investments", monthly_limit=6000.0, warning_threshold=80.0),
        Budget(user_id=user_id, category="Others", monthly_limit=2000.0, warning_threshold=80.0)
    ]
    for b in budgets:
        db.add(b)
    db.commit()

    # 4. Setup Goals
    goals = [
        Goal(user_id=user_id, name="Emergency Fund (3 Months)", target=120000.0, current=45000.0, deadline="2026-12-31"),
        Goal(user_id=user_id, name="New Tech Setup", target=35000.0, current=22000.0, deadline="2026-10-15"),
        Goal(user_id=user_id, name="Goa Vacation Fund", target=20000.0, current=14500.0, deadline="2026-11-20")
    ]
    for g in goals:
        db.add(g)
    db.commit()

    # 5. Generate Grounded Historical & Current Month Transactions
    now = datetime.now()
    this_month_str = now.strftime("%Y-%m")
    last_month_date = now.replace(day=1) - timedelta(days=1)
    last_month_str = last_month_date.strftime("%Y-%m")
    
    sample_txs = []
    
    # --- Income ---
    sample_txs.append(Transaction(
        user_id=user_id, amount=40000.0, type="income", category="Income",
        merchant="Fintech Corp Payroll", description="Monthly Salary Credited",
        date=f"{this_month_str}-01", payment_method="Net Banking", source="bank_sync", confidence_score=1.0
    ))
    sample_txs.append(Transaction(
        user_id=user_id, amount=40000.0, type="income", category="Income",
        merchant="Fintech Corp Payroll", description="Monthly Salary Credited",
        date=f"{last_month_str}-01", payment_method="Net Banking", source="bank_sync", confidence_score=1.0
    ))

    # --- Recurring Subscriptions & Bills ---
    sample_txs.extend([
        Transaction(user_id=user_id, amount=649.0, type="expense", category="Entertainment", merchant="Netflix",
                    description="Netflix Premium Subscription", date=f"{this_month_str}-02", payment_method="Credit Card",
                    source="auto_debit", is_recurring=True, recurring_interval="monthly", confidence_score=0.98),
        Transaction(user_id=user_id, amount=119.0, type="expense", category="Entertainment", merchant="Spotify",
                    description="Spotify Premium Individual", date=f"{this_month_str}-03", payment_method="UPI",
                    source="auto_debit", is_recurring=True, recurring_interval="monthly", confidence_score=0.98),
        Transaction(user_id=user_id, amount=999.0, type="expense", category="Bills & Utilities", merchant="Airtel",
                    description="Airtel Fiber Broadband 200Mbps", date=f"{this_month_str}-05", payment_method="UPI",
                    source="manual", is_recurring=True, recurring_interval="monthly", confidence_score=0.95),
        Transaction(user_id=user_id, amount=1500.0, type="expense", category="Healthcare", merchant="Cult.fit",
                    description="Gym & Fitness Membership", date=f"{this_month_str}-04", payment_method="UPI",
                    source="auto_debit", is_recurring=True, recurring_interval="monthly", confidence_score=0.95),
        Transaction(user_id=user_id, amount=5000.0, type="expense", category="Investments", merchant="Zerodha",
                    description="Nifty 50 Index SIP", date=f"{this_month_str}-05", payment_method="Net Banking",
                    source="auto_debit", is_recurring=True, recurring_interval="monthly", confidence_score=0.99),
    ])

    # --- Food & Dining Transactions (Approaching budget) ---
    sample_txs.extend([
        Transaction(user_id=user_id, amount=480.0, type="expense", category="Food & Dining", merchant="Swiggy",
                    description="Dinner - Biryani by Kilo", date=f"{this_month_str}-02", payment_method="UPI", confidence_score=0.96),
        Transaction(user_id=user_id, amount=320.0, type="expense", category="Food & Dining", merchant="Zomato",
                    description="Lunch - Subway Wrap", date=f"{this_month_str}-04", payment_method="UPI", confidence_score=0.96),
        Transaction(user_id=user_id, amount=1450.0, type="expense", category="Food & Dining", merchant="Blinkit",
                    description="Weekly Grocery Restock", date=f"{this_month_str}-06", payment_method="UPI", confidence_score=0.94),
        Transaction(user_id=user_id, amount=850.0, type="expense", category="Food & Dining", merchant="Swiggy",
                    description="Team Lunch Pizza", date=f"{this_month_str}-08", payment_method="UPI", confidence_score=0.96),
        Transaction(user_id=user_id, amount=1750.0, type="expense", category="Food & Dining", merchant="Toit Brewpub",
                    description="Weekend Dinner with Friends", date=f"{this_month_str}-10", payment_method="Credit Card", confidence_score=0.92),
    ])

    # --- Transportation ---
    sample_txs.extend([
        Transaction(user_id=user_id, amount=340.0, type="expense", category="Transportation", merchant="Uber",
                    description="Uber Premier to Airport", date=f"{this_month_str}-03", payment_method="UPI", confidence_score=0.95),
        Transaction(user_id=user_id, amount=180.0, type="expense", category="Transportation", merchant="Ola Cabs",
                    description="Ola Auto Commute", date=f"{this_month_str}-07", payment_method="UPI", confidence_score=0.95),
        Transaction(user_id=user_id, amount=1200.0, type="expense", category="Transportation", merchant="HP Petrol Pump",
                    description="Car Fuel Full Tank", date=f"{this_month_str}-09", payment_method="Credit Card", confidence_score=0.92),
    ])

    # --- Shopping (Includes high spending) ---
    sample_txs.extend([
        Transaction(user_id=user_id, amount=2499.0, type="expense", category="Shopping", merchant="Amazon",
                    description="Ergonomic Desk Chair Cushion", date=f"{this_month_str}-05", payment_method="Credit Card", confidence_score=0.95),
        Transaction(user_id=user_id, amount=1850.0, type="expense", category="Shopping", merchant="Myntra",
                    description="Formal Shirts & Chinos", date=f"{this_month_str}-08", payment_method="UPI", confidence_score=0.94),
    ])

    # --- Spending Anomaly (Signature Anomaly) ---
    anomaly_tx = Transaction(
        user_id=user_id, amount=7850.0, type="expense", category="Shopping", merchant="Croma Electronics",
        description="Mechanical Keyboard & 4K Monitor Arm", date=f"{this_month_str}-11", payment_method="Credit Card",
        source="manual", is_anomaly=True, anomaly_score=88.5,
        anomaly_reason="This transaction of ₹7,850.00 is 3.9x higher than your median Shopping spend (₹2,000.00) and brings Shopping budget to 243% utilization.",
        anomaly_status="flagged", confidence_score=0.95
    )
    sample_txs.append(anomaly_tx)

    # --- Last month historical baseline transactions ---
    sample_txs.extend([
        Transaction(user_id=user_id, amount=450.0, type="expense", category="Food & Dining", merchant="Swiggy", description="Dinner", date=f"{last_month_str}-03", payment_method="UPI"),
        Transaction(user_id=user_id, amount=520.0, type="expense", category="Food & Dining", merchant="Zomato", description="Lunch", date=f"{last_month_str}-07", payment_method="UPI"),
        Transaction(user_id=user_id, amount=1200.0, type="expense", category="Food & Dining", merchant="Blinkit", description="Groceries", date=f"{last_month_str}-12", payment_method="UPI"),
        Transaction(user_id=user_id, amount=1800.0, type="expense", category="Shopping", merchant="Amazon", description="Books & Stationery", date=f"{last_month_str}-15", payment_method="UPI"),
        Transaction(user_id=user_id, amount=2200.0, type="expense", category="Shopping", merchant="Zara", description="Weekend Clothing", date=f"{last_month_str}-22", payment_method="Credit Card"),
        Transaction(user_id=user_id, amount=999.0, type="expense", category="Bills & Utilities", merchant="Airtel", description="Broadband", date=f"{last_month_str}-05", payment_method="UPI", is_recurring=True),
        Transaction(user_id=user_id, amount=649.0, type="expense", category="Entertainment", merchant="Netflix", description="Netflix", date=f"{last_month_str}-02", payment_method="Credit Card", is_recurring=True),
        Transaction(user_id=user_id, amount=1200.0, type="expense", category="Transportation", merchant="HP Petrol", description="Fuel", date=f"{last_month_str}-10", payment_method="Credit Card"),
        Transaction(user_id=user_id, amount=5000.0, type="expense", category="Investments", merchant="Zerodha", description="Mutual Fund SIP", date=f"{last_month_str}-05", payment_method="Net Banking", is_recurring=True),
    ])

    for t in sample_txs:
        db.add(t)
    db.commit()

    # Re-evaluate all events in controller to populate active Alerts in Action Center
    for t in sample_txs:
        if t.type == "expense" and t.date.startswith(this_month_str):
            process_transaction_event(db, t, user_id=user_id)

    return {
        "status": "success",
        "message": "Demo scenario loaded successfully. Explore the full Finote AI controller workflow.",
        "user": user.name,
        "monthly_income": user.monthly_income,
        "total_seeded_transactions": len(sample_txs),
        "seeded_categories": len(budgets)
    }
