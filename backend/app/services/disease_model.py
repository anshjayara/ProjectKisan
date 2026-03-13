from io import BytesIO

import numpy as np
from PIL import Image

# Disease metadata: treatment, urgency level, and health status
DISEASE_METADATA = {
    "Healthy": {
        "treatment": "No action needed. Keep regular irrigation and nutrient monitoring.",
        "urgency_level": "low",
        "is_healthy": True,
    },
    "Bacterial Blight": {
        "treatment": "Remove infected leaves, avoid overhead watering, and apply copper-based bactericide.",
        "urgency_level": "high",
        "is_healthy": False,
    },
    "Leaf Spot": {
        "treatment": "Prune affected areas, improve air circulation, and apply recommended fungicide.",
        "urgency_level": "medium",
        "is_healthy": False,
    },
}

# Legacy constant for backward compatibility
DISEASE_TREATMENTS = {
    key: value["treatment"] for key, value in DISEASE_METADATA.items()
}


def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize((128, 128))
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    return pixels


def predict_disease(image_bytes: bytes) -> tuple[str, float, str, bool]:
    """Simple heuristic model that mimics a CNN output signature.
    
    Returns:
        tuple: (disease_name, confidence, urgency_level, is_healthy)
    """
    pixels = _preprocess_image(image_bytes)

    avg_r = float(pixels[:, :, 0].mean())
    avg_g = float(pixels[:, :, 1].mean())
    avg_b = float(pixels[:, :, 2].mean())

    if avg_g > (avg_r + 0.08) and avg_g > (avg_b + 0.05):
        disease = "Healthy"
    elif avg_r > avg_g and (avg_r - avg_g) > 0.04:
        disease = "Bacterial Blight"
    else:
        disease = "Leaf Spot"

    confidence = min(0.99, 0.75 + (abs(avg_r - avg_g) * 0.25))
    
    metadata = DISEASE_METADATA[disease]
    
    return disease, confidence, metadata["urgency_level"], metadata["is_healthy"]
