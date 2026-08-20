from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import calculate_forecast

router = APIRouter(prefix="/forecast", tags=["Forecasting"])

@router.get("", response_model=ForecastResponse)
def get_forecasting(db: Session = Depends(get_db)):
    return calculate_forecast(db, user_id=1)
