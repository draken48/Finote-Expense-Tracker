import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, Transaction, Budget, Alert
from app.services.demo_service import seed_demo_data
from app.services.anomaly_service import get_all_anomalies
from app.services.forecast_service import calculate_forecast
from app.services.health_score_service import calculate_financial_health_score
from app.ai.tools import FinancialTools
from app.ai.agent import deterministic_agent_response

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def seeded_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_demo_data(db, user_id=1)
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_anomaly_detection(seeded_db):
    anomalies = get_all_anomalies(seeded_db, user_id=1)
    assert anomalies["total_anomalies_detected"] >= 1
    top_anomaly = anomalies["anomalies"][0]
    assert top_anomaly["amount"] >= 5000.0
    assert top_anomaly["category"] == "Shopping"
    assert top_anomaly["anomaly_score"] > 60.0

def test_forecasting_calculation(seeded_db):
    forecast = calculate_forecast(seeded_db, user_id=1)
    assert forecast["monthly_income"] == 40000.0
    assert forecast["current_spending"] > 0
    assert forecast["projected_monthly_spending"] > 0
    assert len(forecast["category_forecasts"]) > 0

def test_health_score_calculation(seeded_db):
    health = calculate_financial_health_score(seeded_db, user_id=1)
    assert 0 <= health["overall_score"] <= 100
    assert len(health["positive_factors"]) > 0
    assert len(health["attention_factors"]) > 0
    assert len(health["dimensions"]) == 6

def test_ai_tools_and_agent(seeded_db):
    tools = FinancialTools(seeded_db, user_id=1)
    summary = tools.get_monthly_summary()
    assert summary["this_month_income"] == 40000.0
    assert summary["this_month_expenses"] > 0
    
    # Test food query
    food_resp = deterministic_agent_response(tools, "How much did I spend on food this month?")
    assert "Food & Dining" in food_resp.response
    assert len(food_resp.citations) > 0
    
    # Test budget query
    budget_resp = deterministic_agent_response(tools, "Am I going to exceed my budget?")
    assert len(budget_resp.tool_calls_executed) > 0
    assert len(budget_resp.citations) > 0
    
    # Test affordability query
    afford_resp = deterministic_agent_response(tools, "Can I afford to spend ₹5,000 this weekend?")
    assert "5,000" in afford_resp.response or "afford" in afford_resp.response.lower()
