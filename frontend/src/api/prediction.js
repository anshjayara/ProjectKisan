/**
 * Prediction API Helper
 * Handles communication with the backend prediction endpoint
 */

const API_BASE = "http://localhost:8000/api";

/**
 * Send an image file to the backend for crop disease prediction
 * @param {File} imageFile - The image file selected by the user
 * @returns {Promise<Object>} Prediction result with disease, confidence, treatment, urgency, health status
 */
export async function predictImage(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || "Failed to process image prediction"
    );
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
