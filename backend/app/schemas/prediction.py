from pydantic import BaseModel


class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    treatment: str
    urgency_level: str  # "low", "medium", "high"
    is_healthy: bool
