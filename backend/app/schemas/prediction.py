from pydantic import BaseModel


class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    treatment: str
    urgency_level: str  # "low", "medium", "high"
    is_healthy: bool
    disease_hi: str | None = None
    treatment_hi: str | None = None
    status_hi: str | None = None
    urgency_label_hi: str | None = None
