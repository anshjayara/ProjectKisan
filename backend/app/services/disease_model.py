from io import BytesIO

from PIL import Image, ImageStat

DISEASE_NAMES_HI = {
    "Healthy": "स्वस्थ",
    "Bacterial Blight": "बैक्टीरियल ब्लाइट",
    "Leaf Spot": "लीफ स्पॉट",
}

URGENCY_LABELS_HI = {
    "high": "उच्च",
    "medium": "मध्यम",
    "low": "कम",
}

# Disease metadata: treatment, urgency level, and health status
DISEASE_METADATA = {
    "Healthy": {
        "treatment": "No action needed. Keep regular irrigation and nutrient monitoring.",
        "treatment_hi": "कोई कार्रवाई आवश्यक नहीं है। नियमित सिंचाई और पोषक तत्वों की निगरानी जारी रखें।",
        "urgency_level": "low",
        "is_healthy": True,
    },
    "Bacterial Blight": {
        "treatment": "Remove infected leaves, avoid overhead watering, and apply copper-based bactericide.",
        "treatment_hi": "संक्रमित पत्तियों को हटाएं, ऊपर से सिंचाई से बचें, और तांबा आधारित जीवाणुनाशक का उपयोग करें।",
        "urgency_level": "high",
        "is_healthy": False,
    },
    "Leaf Spot": {
        "treatment": "Prune affected areas, improve air circulation, and apply recommended fungicide.",
        "treatment_hi": "प्रभावित हिस्सों की छंटाई करें, हवा का प्रवाह बेहतर करें, और अनुशंसित फफूंदनाशक का उपयोग करें।",
        "urgency_level": "medium",
        "is_healthy": False,
    },
}

# Legacy constant for backward compatibility
DISEASE_TREATMENTS = {
    key: value["treatment"] for key, value in DISEASE_METADATA.items()
}


def _preprocess_image(image_bytes: bytes) -> tuple[float, float, float]:
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize((128, 128))
    mean_r, mean_g, mean_b = ImageStat.Stat(image).mean
    return (mean_r / 255.0, mean_g / 255.0, mean_b / 255.0)


def predict_disease(image_bytes: bytes) -> tuple[str, float, str, bool]:
    """Simple heuristic model that mimics a CNN output signature.
    
    Returns:
        tuple: (disease_name, confidence, urgency_level, is_healthy)
    """
    avg_r, avg_g, avg_b = _preprocess_image(image_bytes)

    if avg_g > (avg_r + 0.08) and avg_g > (avg_b + 0.05):
        disease = "Healthy"
    elif avg_r > avg_g and (avg_r - avg_g) > 0.04:
        disease = "Bacterial Blight"
    else:
        disease = "Leaf Spot"

    confidence = min(0.99, 0.75 + (abs(avg_r - avg_g) * 0.25))
    
    metadata = DISEASE_METADATA[disease]
    
    return disease, confidence, metadata["urgency_level"], metadata["is_healthy"]
