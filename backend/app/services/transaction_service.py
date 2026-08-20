from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.categorization_service import categorize_transaction
from app.services.controller_service import process_transaction_event
from typing import List, Optional, Dict, Any

def create_transaction(db: Session, data: TransactionCreate, user_id: int = 1) -> Transaction:
    # If category or merchant not provided or default, attempt AI categorization
    cat_result = categorize_transaction(data.description, data.merchant, data.amount)
    
    category = data.category if data.category and data.category != "Others" else cat_result["category"]
    merchant = data.merchant if data.merchant else cat_result["merchant"]
    trans_type = data.type if data.type else cat_result["type"]
    confidence = cat_result["confidence"] if not data.category else 1.0
    
    transaction = Transaction(
        user_id=user_id,
        amount=data.amount,
        type=trans_type,
        category=category,
        merchant=merchant,
        description=data.description,
        date=data.date,
        payment_method=data.payment_method or "UPI",
        source=data.source or "manual",
        is_recurring=data.is_recurring or False,
        recurring_interval=data.recurring_interval,
        tags=data.tags,
        mood=data.mood,
        confidence_score=confidence,
        receipt_id=data.receipt_id
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    # Trigger Finance Controller Pipeline
    process_transaction_event(db, transaction, user_id=user_id)
    db.refresh(transaction)
    
    return transaction

def get_transactions(
    db: Session,
    user_id: int = 1,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    trans_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    anomalies_only: Optional[bool] = False
) -> List[Transaction]:
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if search:
        search_fmt = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(search_fmt),
                Transaction.merchant.ilike(search_fmt),
                Transaction.category.ilike(search_fmt)
            )
        )
        
    if category and category != "all":
        query = query.filter(Transaction.category == category)
        
    if payment_method and payment_method != "all":
        query = query.filter(Transaction.payment_method == payment_method)
        
    if trans_type and trans_type != "all":
        query = query.filter(Transaction.type == trans_type)
        
    if start_date:
        query = query.filter(Transaction.date >= start_date)
        
    if end_date:
        query = query.filter(Transaction.date <= end_date)
        
    if anomalies_only:
        query = query.filter(Transaction.is_anomaly == True)
        
    return query.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(skip).limit(limit).all()

def get_transaction_by_id(db: Session, transaction_id: int, user_id: int = 1) -> Optional[Transaction]:
    return db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id
    ).first()

def update_transaction(db: Session, transaction_id: int, data: TransactionUpdate, user_id: int = 1) -> Optional[Transaction]:
    tx = get_transaction_by_id(db, transaction_id, user_id)
    if not tx:
        return None
        
    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(tx, key, value)
        
    db.commit()
    db.refresh(tx)
    
    # Re-evaluate in Finance Controller pipeline
    process_transaction_event(db, tx, user_id=user_id)
    db.refresh(tx)
    
    return tx

def delete_transaction(db: Session, transaction_id: int, user_id: int = 1) -> bool:
    tx = get_transaction_by_id(db, transaction_id, user_id)
    if not tx:
        return False
    db.delete(tx)
    db.commit()
    return True
