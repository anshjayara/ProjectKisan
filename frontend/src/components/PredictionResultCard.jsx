import { getUrgencyBadgeClass, getUrgencyLabel } from "../api/prediction";
import { useLanguage } from "../context/LanguageContext";

/**
 * PredictionResultCard Component
 * Displays the complete prediction result with disease, confidence, urgency, and treatment
 */
function PredictionResultCard({ prediction }) {
  const { t } = useLanguage();

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
  const urgencyLabel = t(getUrgencyLabel(urgency_level));
  const healthStatus = is_healthy ? t("prediction.healthy") : t("prediction.unhealthy");
  const healthStatusClass = is_healthy ? "normal" : "warning";

  return (
    <section className="diagnosis-card" aria-label={t("prediction.resultAria")}>
      <div className="diagnosis-header">
        <h2 className="diagnosis-title">{t("prediction.title")}</h2>
        <span className={`health-status-badge ${healthStatusClass}`}>
          {healthStatus}
        </span>
      </div>

      <div className="diagnosis-main">
        <p className="diagnosis-disease-name">{disease}</p>

        <div className="diagnosis-metrics">
          <div className="metric-item">
            <span className="metric-label">{t("prediction.confidence")}</span>
            <span className="metric-value">{confidence}%</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">{t("prediction.status")}</span>
            <span className={`metric-value ${urgencyBadgeClass}`}>
              {urgencyLabel}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">{t("prediction.urgencyLevel")}</span>
            <span className={`urgency-chip ${urgencyBadgeClass}`}>
              {t(`common.priority.${urgency_level}`)}
            </span>
          </div>
        </div>
      </div>

      <div className="treatment-section">
        <h3 className="treatment-title">{t("prediction.recommendedTreatment")}</h3>
        <p className="treatment-text">{treatment}</p>
      </div>

      {fileName && (
        <div className="file-info">
          <p className="file-label">{t("prediction.imageAnalyzed", { fileName })}</p>
        </div>
      )}
    </section>
  );
}

export default PredictionResultCard;
