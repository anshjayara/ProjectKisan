from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.schemas.prediction import PredictionResponse
from app.services.disease_model import DISEASE_METADATA, predict_disease

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_crop_disease(file: UploadFile = File(...)) -> PredictionResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are supported.",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        disease, confidence, urgency_level, is_healthy = predict_disease(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to process image: {exc}",
        ) from exc

    metadata = DISEASE_METADATA[disease]

    return PredictionResponse(
        disease=disease,
        confidence=round(confidence * 100, 1),  # Convert to percentage
        treatment=metadata["treatment"],
        urgency_level=urgency_level,
        is_healthy=is_healthy,
    )
