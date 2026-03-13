import { getUrgencyBadgeClass, getUrgencyLabel } from "../api/prediction";

/**
 * PredictionResultCard Component
 * Displays the complete prediction result with disease, confidence, urgency, and treatment
 */
function PredictionResultCard({ prediction }) {
  if (!prediction) {
    return null;
  }

  const {
    disease,
    confidence,
    treatment,
    urgency_level,
    is_healthy,
    fileName,
  } = prediction;

  const urgencyBadgeClass = getUrgencyBadgeClass(urgency_level);
  const urgencyLabel = getUrgencyLabel(urgency_level);
  const healthStatus = is_healthy ? "Healthy" : "Unhealthy";
  const healthStatusClass = is_healthy ? "normal" : "warning";

  return (
    <section className="diagnosis-card" aria-label="Prediction result">
      <div className="diagnosis-header">
        <h2 className="diagnosis-title">AI Diagnosis Result</h2>
        <span className={`health-status-badge ${healthStatusClass}`}>
          {healthStatus}
        </span>
      </div>

      <div className="diagnosis-main">
        <p className="diagnosis-disease-name">{disease}</p>

        <div className="diagnosis-metrics">
          <div className="metric-item">
            <span className="metric-label">Confidence Score</span>
            <span className="metric-value">{confidence}%</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Status</span>
            <span className={`metric-value ${urgencyBadgeClass}`}>
              {urgencyLabel}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Urgency Level</span>
            <span className={`urgency-chip ${urgencyBadgeClass}`}>
              {urgency_level.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="treatment-section">
        <h3 className="treatment-title">Recommended Treatment</h3>
        <p className="treatment-text">{treatment}</p>
      </div>

      {fileName && (
        <div className="file-info">
          <p className="file-label">Image analyzed: {fileName}</p>
        </div>
      )}
    </section>
  );
}

export default PredictionResultCard;
