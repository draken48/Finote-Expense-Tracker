from pydantic import BaseModel
from typing import Optional, List

class AnomalyItem(BaseModel):
    transaction_id: int
    amount: float
    category: str
    merchant: Optional[str]
    description: str
    date: str
    anomaly_score: float # 0 to 100
    anomaly_reason: str
    historical_category_mean: float
    historical_category_median: float
    historical_category_max: float
    deviation_multiplier: float
    status: str # flagged, verified, dismissed

class AnomalySummary(BaseModel):
    total_anomalies_detected: int
    pending_review_count: int
    total_anomalous_amount: float
    anomalies: List[AnomalyItem]
