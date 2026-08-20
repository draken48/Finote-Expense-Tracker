import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    # tables remain for next test in file

def test_root_endpoint():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

def test_demo_seed_api():
    with TestClient(app) as client:
        response = client.post("/api/demo/seed")
        assert response.status_code == 200
        assert response.json()["status"] == "success"

def test_analytics_summary_api():
    with TestClient(app) as client:
        client.post("/api/demo/seed")
        response = client.get("/api/analytics/summary")
        assert response.status_code == 200
        data = response.json()
        assert "this_month_expenses" in data
        assert "top_categories" in data

def test_forecast_api():
    with TestClient(app) as client:
        client.post("/api/demo/seed")
        response = client.get("/api/forecast")
        assert response.status_code == 200
        data = response.json()
        assert "daily_burn_rate" in data
        assert "projected_monthly_spending" in data

def test_health_score_api():
    with TestClient(app) as client:
        client.post("/api/demo/seed")
        response = client.get("/api/financial-health")
        assert response.status_code == 200
        data = response.json()
        assert "overall_score" in data
        assert "dimensions" in data

def test_alerts_action_center_api():
    with TestClient(app) as client:
        client.post("/api/demo/seed")
        response = client.get("/api/alerts")
        assert response.status_code == 200
        data = response.json()
        assert "total_active_alerts" in data

def test_receipt_analysis_and_confirm_api():
    with TestClient(app) as client:
        sample_text = "Starbucks Coffee\n1 Cappuccino 240.00\n1 Croissant 180.00\nGST 21.00\nTotal: 441.00\nDate: 2026-08-20\nPayment: UPI"
        res = client.post("/api/receipts/analyze", data={"raw_text": sample_text})
        assert res.status_code == 200
        data = res.json()
        assert data["amount"] == 441.0
        assert data["merchant"] == "Starbucks Coffee"
        
        # Confirm receipt transaction
        confirm_res = client.post("/api/receipts/confirm", json={
            "merchant": data["merchant"],
            "amount": data["amount"],
            "category": data["category"],
            "date": data["date"],
            "description": "Starbucks Coffee",
            "payment_method": "UPI",
            "receipt_id": data.get("receipt_id")
        })
        assert confirm_res.status_code == 200
        assert confirm_res.json()["amount"] == 441.0

def test_ai_chat_api():
    with TestClient(app) as client:
        client.post("/api/demo/seed")
        res = client.post("/api/ai/chat", json={
            "message": "Am I going to exceed my budget?",
            "history": []
        })
        assert res.status_code == 200
        data = res.json()
        assert "response" in data
        assert len(data["citations"]) > 0
