import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, Transaction, Budget, Alert
from app.schemas.transaction import TransactionCreate
from app.services.transaction_service import create_transaction, get_transactions, delete_transaction
from app.services.demo_service import seed_demo_data

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    user = User(id=1, email="test@finote.ai", name="Test User", monthly_income=40000.0)
    db.add(user)
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_create_and_get_transaction(db_session):
    tx_data = TransactionCreate(
        amount=850.0,
        type="expense",
        category="Food & Dining",
        merchant="Swiggy",
        description="Lunch order",
        date="2026-08-20"
    )
    tx = create_transaction(db_session, tx_data, user_id=1)
    assert tx.id is not None
    assert tx.amount == 850.0
    assert tx.merchant == "Swiggy"
    assert tx.category == "Food & Dining"
    
    all_txs = get_transactions(db_session, user_id=1)
    assert len(all_txs) == 1

def test_demo_seed_and_filter(db_session):
    seed_result = seed_demo_data(db_session, user_id=1)
    assert seed_result["status"] == "success"
    
    all_txs = get_transactions(db_session, user_id=1)
    assert len(all_txs) > 10
    
    food_txs = get_transactions(db_session, user_id=1, category="Food & Dining")
    assert len(food_txs) >= 4
