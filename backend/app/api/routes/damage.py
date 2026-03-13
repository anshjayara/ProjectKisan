from fastapi import APIRouter

router = APIRouter()


@router.get("/assessment")
def damage_assessment_placeholder() -> dict[str, str]:
    return {
        "message": "Crop damage assessment module will be added here.",
        "status": "placeholder",
    }
