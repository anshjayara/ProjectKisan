import { useEffect, useMemo, useState } from "react";
import UploadPhotoModal from "./components/UploadPhotoModal";
import PredictionResultCard from "./components/PredictionResultCard";
import InsuranceClaimAssistant from "./components/InsuranceClaimAssistant";
import ProtectedRoute from "./components/ProtectedRoute";
import VoiceInputButton from "./components/VoiceInputButton";
import { generateDashboardData } from "./utils/dashboardMockData";
import LanguageSelectionScreen from "./components/LanguageSelectionScreen";
import { useAuth } from "./context/AuthContext";
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

function AuthScreen({ isSubmitting, serverErrorKey, onLogin, onRegister, t }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localErrorKey, setLocalErrorKey] = useState("");

  const sanitizedPhone = useMemo(() => phone.replace(/\D/g, "").slice(0, 10), [phone]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setLocalErrorKey("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalErrorKey("");

    if (!sanitizedPhone || sanitizedPhone.length !== 10) {
      setLocalErrorKey("auth.errors.invalidPhone");
      return;
    }

    if (!password || password.length < 8) {
      setLocalErrorKey("auth.errors.passwordMin");
      return;
    }

    if (mode === "register") {
      if (!fullName.trim()) {
        setLocalErrorKey("auth.errors.fullNameRequired");
        return;
      }

      if (!confirmPassword) {
        setLocalErrorKey("auth.errors.confirmPasswordRequired");
        return;
      }

      if (password !== confirmPassword) {
        setLocalErrorKey("auth.errors.passwordMismatch");
        return;
      }

      await onRegister({
        full_name: fullName.trim(),
        phone: sanitizedPhone,
        password,
      });
      return;
    }

    await onLogin({
      phone: sanitizedPhone,
      password,
    });
  };

  const activeErrorKey = localErrorKey || serverErrorKey;

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

        <section className="auth-tabs" aria-label={t("auth.tabsAria")}>
          <button
            type="button"
            className={`auth-tab-btn${mode === "login" ? " active" : ""}`}
            onClick={() => switchMode("login")}
          >
            {t("auth.loginTab")}
          </button>
          <button
            type="button"
            className={`auth-tab-btn${mode === "register" ? " active" : ""}`}
            onClick={() => switchMode("register")}
          >
            {t("auth.registerTab")}
          </button>
        </section>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {mode === "register" ? (
            <>
              <label htmlFor="fullName" className="field-label">
                {t("auth.fullNameLabel")}
              </label>
              <div className="input-wrap">
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder={t("auth.fullNamePlaceholder")}
                  autoComplete="name"
                />
              </div>
            </>
          ) : null}

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
              value={sanitizedPhone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("auth.phonePlaceholder")}
              autoComplete="tel-national"
            />
          </div>

          <label htmlFor="password" className="field-label">
            {t("auth.passwordLabel")}
          </label>
          <div className="input-wrap">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "register" ? (
            <>
              <label htmlFor="confirmPassword" className="field-label">
                {t("auth.confirmPasswordLabel")}
              </label>
              <div className="input-wrap">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  autoComplete="new-password"
                />
              </div>
            </>
          ) : null}

          <p className="helper-text">{t("auth.helperText")}</p>
          {activeErrorKey ? <p className="form-error">{t(activeErrorKey)}</p> : null}

          <button type="submit" className="cta-button" disabled={isSubmitting}>
            {isSubmitting
              ? t("auth.loading")
              : mode === "login"
                ? t("auth.loginButton")
                : t("auth.registerButton")}
          </button>

          <p className="auth-switch-row">
            {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
            <button
              type="button"
              className="auth-link-button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? t("auth.registerTab") : t("auth.loginTab")}
            </button>
          </p>
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
  uploadPreview,
  onUploadPreviewChange,
  sensorReadings,
  suggestions,
  alerts,
  language,
  userName,
  onLanguageChange,
  onLogout,
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
          onPreviewSelected={onUploadPreviewChange}
          onAudioCaptured={(audio) => onAudioCaptured({ ...audio, source: "modal" })}
        />

        <header className="top-bar">
          <button type="button" className="logout-btn" onClick={onLogout}>
            {t("auth.logoutButton")}
          </button>
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
                  {t("dashboard.greeting", { name: userName })} <span aria-hidden="true">👋</span>
                </p>
                <p className="location-line">
                  {t("dashboard.location")} <span aria-hidden="true">|</span> {t("dashboard.season")}
                </p>
              </div>

              <div className="avatar-wrap" aria-label={t("dashboard.avatarAria", { name: userName })}>
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
              {uploadPreview?.imagePreviewUrl ? (
                <button
                  type="button"
                  className="upload-preview-tile"
                  onClick={onUploadClick}
                  aria-label={t("upload.chooseDifferent")}
                >
                  <img
                    src={uploadPreview.imagePreviewUrl}
                    alt={t("upload.uploadTitle")}
                    className="upload-preview-tile-image"
                  />
                  <span className="upload-preview-tile-label">{t("upload.chooseDifferent")}</span>
                </button>
              ) : (
                <button type="button" className="upload-trigger upload-trigger--placeholder" onClick={onUploadClick}>
                  {t("upload.triggerButton")}
                </button>
              )}

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
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
    setAuthError,
    login,
    register,
    logout,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const userFirstName = useMemo(() => {
    const fullName = user?.full_name?.trim();
    if (!fullName) {
      return t("dashboard.defaultUserName");
    }
    return fullName.split(/\s+/)[0];
  }, [t, user]);

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

  const handleLoginSubmit = async ({ phone, password }) => {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      await login({ phone, password });
      setActiveTab("home");
    } catch (error) {
      setAuthError(error?.message || "auth.errors.requestFailed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async ({ full_name, phone, password }) => {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      await register({ full_name, phone, password });
      setActiveTab("home");
    } catch (error) {
      setAuthError(error?.message || "auth.errors.requestFailed");
    } finally {
      setAuthSubmitting(false);
    }
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

  if (isLoadingAuth) {
    return null;
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      fallback={(
        <AuthScreen
          isSubmitting={authSubmitting}
          serverErrorKey={authError}
          onLogin={handleLoginSubmit}
          onRegister={handleRegisterSubmit}
          t={t}
        />
      )}
    >
      <DashboardScreen
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={openUploadModal}
        onAudioCaptured={handleAudioCaptured}
        isUploadModalOpen={isUploadModalOpen}
        onUploadModalClose={closeUploadModal}
        onPredictionComplete={handlePredictionComplete}
        uploadPreview={uploadPreview}
        onUploadPreviewChange={setUploadPreview}
        diagnosis={diagnosis}
        recordedAudio={recordedAudio}
        sensorReadings={sensorData}
        suggestions={suggestions}
        alerts={alerts}
        language={language}
        userName={userFirstName}
        onLanguageChange={setLanguage}
        onLogout={logout}
        t={t}
      />
    </ProtectedRoute>
  );
}

export default App;
