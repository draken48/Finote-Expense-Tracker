from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import AnalyticsSummary
from app.services.analytics_service import get_analytics_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    return get_analytics_summary(db, user_id=1)
