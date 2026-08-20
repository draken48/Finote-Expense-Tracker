from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.demo_service import seed_demo_data

router = APIRouter(prefix="/demo", tags=["Demo Mode"])

@router.post("/seed")
def trigger_demo_seed(db: Session = Depends(get_db)):
    return seed_demo_data(db, user_id=1)
