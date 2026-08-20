from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    AutoCategorizeRequest, AutoCategorizeResponse
)
from app.services.transaction_service import (
    create_transaction, get_transactions, get_transaction_by_id, update_transaction, delete_transaction
)
from app.services.categorization_service import categorize_transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    trans_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    anomalies_only: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    return get_transactions(
        db, user_id=1, skip=skip, limit=limit, search=search,
        category=category, payment_method=payment_method, trans_type=trans_type,
        start_date=start_date, end_date=end_date, anomalies_only=anomalies_only
    )

@router.post("", response_model=TransactionResponse)
def add_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction(db, payload, user_id=1)

@router.post("/categorize", response_model=AutoCategorizeResponse)
def auto_categorize(payload: AutoCategorizeRequest):
    res = categorize_transaction(payload.description, payload.merchant, payload.amount)
    return AutoCategorizeResponse(**res)

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = get_transaction_by_id(db, transaction_id, user_id=1)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.put("/{transaction_id}", response_model=TransactionResponse)
def edit_transaction(transaction_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)):
    tx = update_transaction(db, transaction_id, payload, user_id=1)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.delete("/{transaction_id}")
def remove_transaction(transaction_id: int, db: Session = Depends(get_db)):
    success = delete_transaction(db, transaction_id, user_id=1)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"status": "success", "message": "Transaction deleted successfully"}
