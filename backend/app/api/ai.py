from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ai_chat import AIChatRequest, AIChatResponse
from app.ai.agent import run_ai_agent

router = APIRouter(prefix="/ai", tags=["AI Advisor"])

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(payload: AIChatRequest, db: Session = Depends(get_db)):
    return run_ai_agent(db, payload, user_id=1)
