from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.alert import ActionCenterSummary, AlertResponse
from app.services.controller_service import get_action_center_summary
from app.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts & Action Center"])

@router.get("", response_model=ActionCenterSummary)
def list_alerts(db: Session = Depends(get_db)):
    return get_action_center_summary(db, user_id=1)

@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == 1).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_dismissed = True
    db.commit()
    return {"status": "success", "message": "Alert dismissed"}

@router.post("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == 1).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "success", "message": "Alert marked as read"}
