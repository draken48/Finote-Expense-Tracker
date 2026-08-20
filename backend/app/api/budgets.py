from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.budget import BudgetCreate, BudgetStatus, BudgetResponse
from app.services.budget_service import get_budget_statuses, set_or_update_budget

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetStatus])
def list_budgets(db: Session = Depends(get_db)):
    return get_budget_statuses(db, user_id=1)

@router.post("", response_model=BudgetResponse)
def set_budget(payload: BudgetCreate, db: Session = Depends(get_db)):
    return set_or_update_budget(
        db, category=payload.category,
        monthly_limit=payload.monthly_limit,
        warning_threshold=payload.warning_threshold or 80.0,
        user_id=1
    )
