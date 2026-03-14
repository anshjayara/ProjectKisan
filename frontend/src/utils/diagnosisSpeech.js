const HINDI_URGENCY_MAP = {
  high: "उच्च",
  medium: "मध्यम",
  low: "कम",
};

function formatConfidence(confidence) {
  const numericConfidence = Number(confidence);

  if (!Number.isFinite(numericConfidence)) {
    return "0.0";
  }

  return numericConfidence.toFixed(1);
}

function normalizeRecommendation(result) {
  return result?.recommendation || result?.treatment || "";
}

function normalizeHindiRecommendation(result) {
  return result?.recommendation_hi || result?.treatment_hi || normalizeRecommendation(result);
}

export function buildDiagnosisSpeechText(result, language = "en") {
  if (!result) {
    return "";
  }

  const disease = result.disease || "Unknown issue";
  const confidence = formatConfidence(result.confidence);
  const isHealthy = Boolean(result.is_healthy);
  const urgency = result.urgency_level || "low";
  const recommendation = normalizeRecommendation(result);

  if (language === "hi") {
    const diseaseHindi = result.disease_hi || disease;
    const cropStatus = result.status_hi || (isHealthy ? "स्वस्थ" : "अस्वस्थ");
    const urgencyLabel = result.urgency_label_hi || HINDI_URGENCY_MAP[urgency] || HINDI_URGENCY_MAP.low;
    const recommendationHindi = normalizeHindiRecommendation(result);
    const diseaseSummary = isHealthy
      ? `अपलोड की गई फसल की तस्वीर ${diseaseHindi} स्थिति दर्शाती है।`
      : `अपलोड की गई फसल की तस्वीर में ${diseaseHindi} की संभावना दिखाई दे रही है।`;

    return `${diseaseSummary} फसल की स्थिति ${cropStatus} है। विश्वसनीयता स्कोर ${confidence} प्रतिशत है। सुझाई गई कार्रवाई: ${recommendationHindi} तात्कालिकता स्तर ${urgencyLabel} है।`;
  }

  const cropStatus = isHealthy ? "healthy" : "unhealthy";
  const diseaseSummary = isHealthy
    ? `The uploaded crop image suggests the crop is ${disease}.`
    : `The uploaded crop image shows possible ${disease}.`;

  return `${diseaseSummary} The crop condition is ${cropStatus}. Confidence score is ${confidence} percent. Recommended action: ${recommendation} Urgency level is ${urgency}.`;
}

export function getPreferredVoice(voices = [], language = "en") {
  if (!voices.length) {
    return null;
  }

  const preferredLocales = language === "hi"
    ? ["hi-IN", "hi"]
    : ["en-IN", "en-US", "en-GB", "en"];

  for (const locale of preferredLocales) {
    const exactMatch = voices.find((voice) => voice.lang?.toLowerCase() === locale.toLowerCase());
    if (exactMatch) {
      return exactMatch;
    }
  }

  return voices.find((voice) => voice.lang?.toLowerCase().startsWith(language.toLowerCase())) || voices[0] || null;
}

export function speakDiagnosisRecommendation(text, language = "en", voices = []) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = language === "hi" ? 0.9 : 0.95;
  utterance.pitch = 1;

  const preferredVoice = getPreferredVoice(voices, language);
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
}