from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import damage, predict, weather

app = FastAPI(
    title="AgroAid API",
    description="AI-powered agriculture platform backend prototype.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api", tags=["Disease Detection"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Prediction"])
app.include_router(damage.router, prefix="/api/damage", tags=["Crop Damage Assessment"])


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "AgroAid API is running"}
