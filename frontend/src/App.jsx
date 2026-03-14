import { useEffect, useMemo, useState } from "react";
import UploadPhotoModal from "./components/UploadPhotoModal";
import PredictionResultCard from "./components/PredictionResultCard";
import InsuranceClaimAssistant from "./components/InsuranceClaimAssistant";
import VoiceInputButton from "./components/VoiceInputButton";
import { generateDashboardData } from "./utils/dashboardMockData";
import LanguageSelectionScreen from "./components/LanguageSelectionScreen";
import { useLanguage } from "./context/LanguageContext";

function formatAudioDuration(durationMs = 0) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function VoiceCaptureSummary({ recordedAudio, t }) {
  if (!recordedAudio) {
    return null;
  }

  return (
    <section className="voice-summary-card" aria-label={t("voice.summaryAria")}>
      <div className="voice-summary-head">
        <div>
          <p className="voice-summary-eyebrow">{t("voice.latestRecording")}</p>
          <h3 className="voice-summary-title">{t("voice.summaryTitle")}</h3>
        </div>
        <span className="voice-summary-badge">{t(`voice.source.${recordedAudio.source}`)}</span>
      </div>

      <p className="voice-summary-text">{t("voice.summaryDescription")}</p>

      <div className="voice-summary-meta">
        <span>{t("voice.duration", { duration: formatAudioDuration(recordedAudio.durationMs) })}</span>
        <span>{recordedAudio.mimeType}</span>
      </div>

      <audio controls className="voice-audio-player" src={recordedAudio.url}>
        {t("voice.audioFallback")}
      </audio>
    </section>
  );
}

function SensorCard({ label, value, unit, status, icon, wide = false, t }) {
  return (
    <article
      className={`sensor-card ${wide ? "wide" : ""}`}
      aria-label={t("dashboard.sensorReadingAria", { label })}
    >
      <div className="sensor-card-top">
        <span className={`mini-icon ${status}`}>{icon}</span>
        <span className="sensor-label">{label}</span>
      </div>
      <p className={`sensor-value ${status}`}>
        {value}
        {unit ? <span className="sensor-unit">{unit}</span> : null}
      </p>
      <span className={`status-chip ${status}`}>{t(`common.status.${status}`)}</span>
    </article>
  );
}

function HealthScoreCard({ onUploadClick, t }) {
  return (
    <section className="health-card" aria-label={t("healthCard.aria")}>
      <div className="health-card-heading">
        <span className="mini-icon normal">AI</span>
        <h3>{t("healthCard.title")}</h3>
      </div>
      <p className="health-title">{t("healthCard.scoreLabel")}</p>
      <div className="health-score-row">
        <p className="health-score">{t("healthCard.scoreValue")}</p>
        <span className="risk-badge">{t("healthCard.riskLevel")}</span>
      </div>
      <ul className="health-notes">
        <li>{t("healthCard.note1")}</li>
        <li>{t("healthCard.note2")}</li>
        <li>{t("healthCard.note3")}</li>
      </ul>
      <button type="button" className="confirm-upload-button" onClick={onUploadClick}>
        {t("healthCard.uploadAction")}
      </button>
    </section>
  );
}

function ActivitySuggestionCard({ title, description, priority, icon, t }) {
  return (
    <article className={`activity-card activity-card--${priority}`} aria-label={title}>
      <div className="activity-card-left">
        <span className="activity-icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="activity-card-body">
        <p className="activity-title">{title}</p>
        <p className="activity-description">{description}</p>
      </div>
      <span className={`activity-priority activity-priority--${priority}`}>
        {t(`common.priority.${priority}`)}
      </span>
    </article>
  );
}

function AlertFeedCard({ title, description, severity, icon, time, t }) {
  const priority = severity === "high" ? "high" : severity === "low" ? "low" : "medium";

  return (
    <article className={`activity-card activity-card--${priority}`} aria-label={title}>
      <div className="activity-card-left">
        <span className="activity-icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="activity-card-body">
        <p className="activity-title">{title}</p>
        <p className="activity-description">{description}</p>
        <p className="diagnosis-meta">{time}</p>
      </div>
      <span className={`activity-priority activity-priority--${priority}`}>
        {t(`common.priority.${severity}`)}
      </span>
    </article>
  );
}

function BottomNavigation({ activeTab, onTabChange, t }) {
  const tabs = [
    { key: "home", label: t("nav.home") },
    { key: "sensors", label: t("nav.sensors") },
    { key: "upload", label: t("nav.upload") },
    { key: "alerts", label: t("nav.alerts") },
    { key: "reports", label: t("nav.reports") },
  ];

  return (
    <nav className="bottom-nav" aria-label={t("nav.bottomAria")}>
      {tabs.map((tab) => {
        const key = tab.key;
        return (
          <button
            key={key}
            type="button"
            className={`nav-item${activeTab === key ? " active" : ""}`}
            onClick={() => onTabChange(key)}
          >
            <span className={`nav-icon${key === "alerts" ? " dot" : ""}`} aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function LoginScreen({ phoneNumber, onPhoneChange, onSubmit, errorKey, t }) {
  return (
    <div className="app-shell">
      <div className="top-strip" aria-hidden="true" />

      <main className="login-card" role="main" aria-label={t("auth.loginScreenAria")}>
        <section className="brand-block">
          <div className="logo" aria-hidden="true">
            <span className="leaf-icon" />
          </div>
          <h1>{t("auth.title")}</h1>
          <p className="brand-subtitle">
            {t("auth.subtitleLine1")}
            <br />
            {t("auth.subtitleLine2")}
          </p>
        </section>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="phone" className="field-label">
            {t("auth.phoneLabel")}
          </label>

          <div className="phone-input-wrap">
            <span className="country-code" aria-hidden="true">
              <span className="globe">O</span>
              {t("common.countryCode")}
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phoneNumber}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder={t("auth.phonePlaceholder")}
            />
          </div>

          <p className="helper-text">{t("auth.helperText")}</p>
          {errorKey ? <p className="form-error">{t(errorKey)}</p> : null}

          <button type="submit" className="cta-button">
            {t("auth.getStarted")}
          </button>
        </form>

        <footer className="screen-footer">
          <p>
            {t("auth.termsPrefix")} <a href="#">{t("auth.termsLink")}</a> {t("auth.and")} <a href="#">{t("auth.privacyLink")}</a>.
          </p>
          <p className="version">{t("auth.version")}</p>
        </footer>
      </main>
    </div>
  );
}

function DashboardScreen({
  activeTab,
  onTabChange,
  onUploadClick,
  onAudioCaptured,
  diagnosis,
  recordedAudio,
  isUploadModalOpen,
  onUploadModalClose,
  onPredictionComplete,
  sensorReadings,
  suggestions,
  alerts,
  language,
  onLanguageChange,
  t,
}) {
  const primarySensors = sensorReadings.slice(0, 4);
  const lightSensor = sensorReadings[4] || null;

  return (
    <div className="dashboard-shell">
      <main className="mobile-screen" role="main" aria-label={t("dashboard.homeAria")}>
        <UploadPhotoModal
          isOpen={isUploadModalOpen}
          onClose={onUploadModalClose}
          onPredictionComplete={onPredictionComplete}
          onAudioCaptured={(audio) => onAudioCaptured({ ...audio, source: "modal" })}
        />

        <header className="top-bar">
          <h1>{t("common.appName")}</h1>
          <div className="language-toggle" aria-label={t("common.language.switchLabel")}>
            <button
              type="button"
              className={`language-toggle-btn${language === "en" ? " active" : ""}`}
              onClick={() => onLanguageChange("en")}
            >
              {t("common.language.english")}
            </button>
            <button
              type="button"
              className={`language-toggle-btn${language === "hi" ? " active" : ""}`}
              onClick={() => onLanguageChange("hi")}
            >
              {t("common.language.hindi")}
            </button>
          </div>
        </header>

        {activeTab === "home" ? (
          <>
            <section className="welcome-row">
              <div>
                <p className="greeting">
                  {t("dashboard.greeting")} <span aria-hidden="true">👋</span>
                </p>
                <p className="location-line">
                  {t("dashboard.location")} <span aria-hidden="true">|</span> {t("dashboard.season")}
                </p>
              </div>

              <div className="avatar-wrap" aria-label={t("dashboard.avatarAria")}>
                <div className="avatar" aria-hidden="true" />
                <span className="online-dot" aria-hidden="true" />
              </div>
            </section>

            <section className="sensor-panel" aria-label={t("dashboard.sensorStatus")}>
              <div className="sensor-panel-head">
                <span className="mini-icon normal">IO</span>
                <h2>{t("dashboard.sensorStatus")}</h2>
              </div>

              <div className="sensor-grid">
                {primarySensors.map((sensor) => (
                  <SensorCard
                    key={sensor.id}
                    {...sensor}
                    label={t(sensor.labelKey)}
                    value={sensor.valueKey ? t(sensor.valueKey) : sensor.value}
                    unit={sensor.unitKey ? t(sensor.unitKey) : sensor.unit}
                    t={t}
                  />
                ))}
                {lightSensor ? (
                  <SensorCard
                    {...lightSensor}
                    label={t(lightSensor.labelKey)}
                    value={lightSensor.valueKey ? t(lightSensor.valueKey) : lightSensor.value}
                    unit={lightSensor.unitKey ? t(lightSensor.unitKey) : lightSensor.unit}
                    wide
                    t={t}
                  />
                ) : null}
              </div>
            </section>

            <HealthScoreCard onUploadClick={onUploadClick} t={t} />

            <section className="section-head activity-head">
              <h2>{t("dashboard.activitySuggestions")}</h2>
            </section>

            <section className="activity-list" aria-label={t("dashboard.farmActivityAria")}>
              {suggestions.map((activity) => (
                <ActivitySuggestionCard
                  key={activity.id}
                  title={t(activity.titleKey)}
                  description={t(activity.descriptionKey)}
                  priority={activity.priority}
                  icon={activity.icon}
                  t={t}
                />
              ))}
            </section>
          </>
        ) : null}

        {activeTab === "sensors" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>{t("dashboard.sensorsHeader")}</h2>
            </div>

            <section className="sensor-panel" aria-label={t("dashboard.detailedSensorAria")}>
              <div className="sensor-grid">
                {sensorReadings.map((sensor) => (
                  <SensorCard
                    key={sensor.id}
                    {...sensor}
                    label={t(sensor.labelKey)}
                    value={sensor.valueKey ? t(sensor.valueKey) : sensor.value}
                    unit={sensor.unitKey ? t(sensor.unitKey) : sensor.unit}
                    wide={sensor.id === "light"}
                    t={t}
                  />
                ))}
              </div>
            </section>

            <p className="empty-copy">{t("dashboard.sensorsNote")}</p>
          </section>
        ) : null}

        {activeTab === "upload" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>{t("dashboard.uploadHeader")}</h2>
            </div>

            <div className="upload-action-grid">
              <button type="button" className="upload-trigger" onClick={onUploadClick}>
                {t("upload.triggerButton")}
              </button>

              <VoiceInputButton
                compact
                className="upload-voice-input"
                onAudioCaptured={(audio) => onAudioCaptured({ ...audio, source: "upload" })}
              />
            </div>

            {diagnosis && (
              <PredictionResultCard prediction={diagnosis} />
            )}

            {recordedAudio && <VoiceCaptureSummary recordedAudio={recordedAudio} t={t} />}

            {!diagnosis && !recordedAudio && (
              <p className="empty-copy">{t("dashboard.uploadEmpty")}</p>
            )}
          </section>
        ) : null}

        {activeTab === "alerts" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>{t("dashboard.alertsHeader")}</h2>
            </div>
            <section className="activity-list" aria-label={t("dashboard.farmAlertAria")}>
              {alerts.map((alertItem) => (
                <AlertFeedCard
                  key={alertItem.id}
                  title={t(alertItem.titleKey)}
                  description={t(alertItem.descriptionKey)}
                  severity={alertItem.severity}
                  icon="AL"
                  time={t(alertItem.timeKey)}
                  t={t}
                />
              ))}
            </section>
          </section>
        ) : null}

        {activeTab === "reports" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>{t("dashboard.reportsHeader")}</h2>
            </div>
            <InsuranceClaimAssistant />
          </section>
        ) : null}

        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} t={t} />
      </main>
    </div>
  );
}

function App() {
  const { language, setLanguage, t, isReady, hasSelectedLanguage } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneErrorKey, setPhoneErrorKey] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const sanitizedPhone = useMemo(() => phoneNumber.replace(/\D/g, ""), [phoneNumber]);

  useEffect(() => {
    const generated = generateDashboardData();
    setSensorData(generated.sensorData);
    setSuggestions(generated.suggestions);
    setAlerts(generated.alerts);
  }, []);

  useEffect(() => () => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }
  }, [recordedAudio]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (sanitizedPhone.length !== 10) {
      setPhoneErrorKey("auth.phoneError");
      return;
    }
    setPhoneErrorKey("");
    setIsAuthenticated(true);
    setActiveTab("home");
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handlePredictionComplete = (predictionResult) => {
    setDiagnosis(predictionResult);
    setActiveTab("upload");
  };

  const handleAudioCaptured = (audioResult) => {
    setRecordedAudio(audioResult);
    setActiveTab("upload");
  };

  if (!isReady) {
    return null;
  }

  if (!hasSelectedLanguage) {
    return <LanguageSelectionScreen />;
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        phoneNumber={phoneNumber}
        onPhoneChange={(value) => {
          const nextValue = value.replace(/\D/g, "").slice(0, 10);
          setPhoneNumber(nextValue);
          if (phoneErrorKey) {
            setPhoneErrorKey("");
          }
        }}
        onSubmit={handleLoginSubmit}
        errorKey={phoneErrorKey}
        t={t}
      />
    );
  }

  return (
    <DashboardScreen
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onUploadClick={openUploadModal}
      onAudioCaptured={handleAudioCaptured}
      isUploadModalOpen={isUploadModalOpen}
      onUploadModalClose={closeUploadModal}
      onPredictionComplete={handlePredictionComplete}
      diagnosis={diagnosis}
      recordedAudio={recordedAudio}
      sensorReadings={sensorData}
      suggestions={suggestions}
      alerts={alerts}
      language={language}
      onLanguageChange={setLanguage}
      t={t}
    />
  );
}

export default App;
