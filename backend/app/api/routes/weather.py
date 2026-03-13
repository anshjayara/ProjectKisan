from fastapi import APIRouter

router = APIRouter()


@router.get("/risk")
def weather_risk_placeholder() -> dict[str, str]:
    return {
        "message": "Weather-based disease prediction module will be added here.",
        "status": "placeholder",
    }
