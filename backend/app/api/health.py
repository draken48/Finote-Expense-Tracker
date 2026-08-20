from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.health_score import HealthScoreResponse
from app.services.health_score_service import calculate_financial_health_score

router = APIRouter(prefix="/financial-health", tags=["Financial Health"])

@router.get("", response_model=HealthScoreResponse)
def get_health_score(db: Session = Depends(get_db)):
    return calculate_financial_health_score(db, user_id=1)
