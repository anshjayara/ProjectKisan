from io import BytesIO

import numpy as np
from PIL import Image

# Placeholder disease classes and treatment suggestions.
DISEASE_TREATMENTS = {
    "Healthy": "No action needed. Keep regular irrigation and nutrient monitoring.",
    "Bacterial Blight": "Remove infected leaves, avoid overhead watering, and apply copper-based bactericide.",
    "Leaf Spot": "Prune affected areas, improve air circulation, and apply recommended fungicide.",
}


def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize((128, 128))
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    return pixels


def predict_disease(image_bytes: bytes) -> tuple[str, float]:
    """Simple heuristic model that mimics a CNN output signature."""
    pixels = _preprocess_image(image_bytes)

    avg_r = float(pixels[:, :, 0].mean())
    avg_g = float(pixels[:, :, 1].mean())
    avg_b = float(pixels[:, :, 2].mean())

    if avg_g > (avg_r + 0.08) and avg_g > (avg_b + 0.05):
        return "Healthy", 0.87
    if avg_r > avg_g and (avg_r - avg_g) > 0.04:
        return "Bacterial Blight", 0.81
    return "Leaf Spot", 0.78
