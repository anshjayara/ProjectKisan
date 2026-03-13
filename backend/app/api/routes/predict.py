from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.schemas.prediction import PredictionResponse
from app.services.disease_model import DISEASE_TREATMENTS, predict_disease

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
        disease, confidence = predict_disease(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to process image: {exc}",
        ) from exc

    return PredictionResponse(
        disease=disease,
        confidence=round(confidence, 2),
        treatment=DISEASE_TREATMENTS[disease],
    )
