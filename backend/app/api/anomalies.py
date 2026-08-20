from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.anomaly import AnomalySummary
from app.services.anomaly_service import get_all_anomalies
from app.models.transaction import Transaction

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.get("", response_model=AnomalySummary)
def list_anomalies(db: Session = Depends(get_db)):
    return get_all_anomalies(db, user_id=1)

@router.post("/{transaction_id}/status")
def update_anomaly_status(transaction_id: int, status: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == 1).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    tx.anomaly_status = status
    if status == "dismissed":
        tx.is_anomaly = False
    db.commit()
    return {"status": "success", "message": f"Anomaly status updated to '{status}'"}
