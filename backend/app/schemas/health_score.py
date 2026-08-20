from pydantic import BaseModel
from typing import List, Dict

class ScoreDimension(BaseModel):
    name: str
    score: float # 0-100 or weighted score
    weight: float # e.g. 0.30
    weighted_score: float
    status: str # excellent, good, warning, critical
    details: str

class HealthScoreResponse(BaseModel):
    overall_score: int # 0 to 100
    rating_label: str # Excellent, Good, Fair, At Risk, Critical
    positive_factors: List[str]
    attention_factors: List[str]
    dimensions: List[ScoreDimension]
    key_recommendation: str
    reproducible_breakdown: Dict[str, float]
