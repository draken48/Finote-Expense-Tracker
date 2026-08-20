from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.api import api_router
from app.models import User, Transaction, Budget, Alert, Goal, ReceiptRecord
from app.services.budget_service import init_default_budgets

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize default demo user and budgets if empty
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(id=1, email="finance.controller@finote.ai", name="Razorpay Demo Controller", monthly_income=40000.0, currency="INR")
            db.add(user)
            db.commit()
        init_default_budgets(db, user_id=1)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Finote AI — Intelligent Finance Controller REST API for Track 4 (Razorpay AI Builder 2026)",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "pitch": "Observe → Understand → Detect → Predict → Recommend → Act"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
