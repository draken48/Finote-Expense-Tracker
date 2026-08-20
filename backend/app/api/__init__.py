from fastapi import APIRouter
from app.api.transactions import router as transactions_router
from app.api.budgets import router as budgets_router
from app.api.analytics import router as analytics_router
from app.api.anomalies import router as anomalies_router
from app.api.forecast import router as forecast_router
from app.api.health import router as health_router
from app.api.alerts import router as alerts_router
from app.api.receipts import router as receipts_router
from app.api.ai import router as ai_router
from app.api.demo import router as demo_router

api_router = APIRouter()
api_router.include_router(transactions_router)
api_router.include_router(budgets_router)
api_router.include_router(analytics_router)
api_router.include_router(anomalies_router)
api_router.include_router(forecast_router)
api_router.include_router(health_router)
api_router.include_router(alerts_router)
api_router.include_router(receipts_router)
api_router.include_router(ai_router)
api_router.include_router(demo_router)

__all__ = ["api_router"]
