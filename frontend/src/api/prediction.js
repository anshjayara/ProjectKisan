/**
 * Prediction API Helper
 * Handles communication with the backend prediction endpoint
 */

const DEFAULT_API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Send an image file to the backend for crop disease prediction
 * @param {File} imageFile - The image file selected by the user
 * @returns {Promise<Object>} Prediction result with disease, confidence, treatment, urgency, health status
 */
export async function predictImage(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check backend status and try again.");
    }
    throw new Error("Cannot reach backend API. Ensure FastAPI is running.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail = "Failed to process image prediction";
    try {
      const errorData = await response.json();
      detail = errorData.detail || detail;
    } catch {
      // Ignore JSON parsing issues and use fallback detail message.
    }
    throw new Error(detail);
  }

  return response.json();
}

/**
 * Map urgency level to badge styling
 */
export function getUrgencyBadgeClass(urgencyLevel) {
  switch (urgencyLevel) {
    case "high":
      return "critical";
    case "medium":
      return "warning";
    case "low":
    default:
      return "normal";
  }
}

/**
 * Get a human-readable urgency label
 */
export function getUrgencyLabel(urgencyLevel) {
  switch (urgencyLevel) {
    case "high":
      return "Urgent action recommended";
    case "medium":
      return "Action recommended soon";
    case "low":
    default:
      return "Routine care";
  }
}
