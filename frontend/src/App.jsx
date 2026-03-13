import { useEffect, useMemo, useState } from "react";
import UploadPhotoModal from "./components/UploadPhotoModal";
import PredictionResultCard from "./components/PredictionResultCard";
import InsuranceClaimAssistant from "./components/InsuranceClaimAssistant";
import { generateDashboardData } from "./utils/dashboardMockData";

const MOCK_DIAGNOSES = [
  {
    disease: "Healthy Leaf",
    treatment: "No immediate action needed. Continue regular irrigation and weekly observation.",
    urgent: false,
  },
  {
    disease: "Possible Leaf Spot",
    treatment: "Remove infected leaves and apply a copper-based fungicide in early morning.",
    urgent: false,
  },
  {
    disease: "Possible Blight Detected",
    treatment: "Start fungicide treatment today and isolate affected plants to limit spread.",
    urgent: true,
  },
  {
    disease: "Pest Damage Suspected",
    treatment: "Inspect underside of leaves and use neem oil spray for 3 to 5 days.",
    urgent: true,
  },
];

function runMockDiagnosis(file) {
  const index = (file.size + file.name.length) % MOCK_DIAGNOSES.length;
  const confidence = Math.min(98, 74 + (file.size % 22));
  return {
    ...MOCK_DIAGNOSES[index],
    confidence,
  };
}

function SensorCard({ label, value, unit, status, icon, wide = false }) {
  return (
    <article className={`sensor-card ${wide ? "wide" : ""}`} aria-label={`${label} reading`}>
      <div className="sensor-card-top">
        <span className={`mini-icon ${status}`}>{icon}</span>
        <span className="sensor-label">{label}</span>
      </div>
      <p className={`sensor-value ${status}`}>
        {value}
        {unit ? <span className="sensor-unit">{unit}</span> : null}
      </p>
      <span className={`status-chip ${status}`}>{status}</span>
    </article>
  );
}

function HealthScoreCard({ onUploadClick }) {
  return (
    <section className="health-card" aria-label="AI crop health">
      <div className="health-card-heading">
        <span className="mini-icon normal">AI</span>
        <h3>AI Crop Health</h3>
      </div>
      <p className="health-title">Crop Health Score</p>
      <div className="health-score-row">
        <p className="health-score">86%</p>
        <span className="risk-badge">LOW</span>
      </div>
      <ul className="health-notes">
        <li>Soil moisture currently stable in monitored zones.</li>
        <li>Humidity elevated, fungal risk may increase in 48 hrs.</li>
        <li>Schedule preventive spray in high-density crop rows.</li>
      </ul>
      <button type="button" className="confirm-upload-button" onClick={onUploadClick}>
        Upload Crop Photo for AI Confirmation
      </button>
    </section>
  );
}

function ActivitySuggestionCard({ title, description, priority, icon }) {
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
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </article>
  );
}

function AlertFeedCard({ title, description, severity, icon, time }) {
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
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    </article>
  );
}

function DiagnosisResultCard({ diagnosis, selectedFileName }) {
  if (!diagnosis) {
    return null;
  }

  return (
    <section className="diagnosis-card" aria-label="Diagnosis result">
      <p className="diagnosis-title">Diagnosis Result</p>
      <p className="diagnosis-name">{diagnosis.disease}</p>
      <p className="diagnosis-meta">
        Confidence: <strong>{diagnosis.confidence}%</strong>
      </p>
      <p className="diagnosis-meta">
        Urgency: <strong>{diagnosis.urgent ? "Urgent action recommended" : "Routine care"}</strong>
      </p>
      <p className="treatment-title">Treatment Recommendation</p>
      <p className="treatment-text">{diagnosis.treatment}</p>
      {selectedFileName ? <p className="file-label">Image: {selectedFileName}</p> : null}
    </section>
  );
}

function BottomNavigation({ activeTab, onTabChange }) {
  const tabs = ["Home", "Sensors", "Upload", "Alerts", "Reports"];

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {tabs.map((tab) => {
        const key = tab.toLowerCase();
        return (
          <button
            key={tab}
            type="button"
            className={`nav-item${activeTab === key ? " active" : ""}`}
            onClick={() => onTabChange(key)}
          >
            <span className={`nav-icon${key === "alerts" ? " dot" : ""}`} aria-hidden="true" />
            {tab}
          </button>
        );
      })}
    </nav>
  );
}

function LoginScreen({ phoneNumber, onPhoneChange, onSubmit, error }) {
  return (
    <div className="app-shell">
      <div className="top-strip" aria-hidden="true" />

      <main className="login-card" role="main" aria-label="Login screen">
        <section className="brand-block">
          <div className="logo" aria-hidden="true">
            <span className="leaf-icon" />
          </div>
          <h1>Your AI Crop Doctor</h1>
          <p className="brand-subtitle">
            Identify diseases and get expert
            <br />
            treatment recommendations in seconds.
          </p>
        </section>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="phone" className="field-label">
            Login with Phone Number
          </label>

          <div className="phone-input-wrap">
            <span className="country-code" aria-hidden="true">
              <span className="globe">O</span>
              +91
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phoneNumber}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="Enter 10-digit mobile number"
            />
          </div>

          <p className="helper-text">A 6-digit OTP will be sent to your phone for secure verification.</p>
          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="cta-button">
            Get Started
          </button>
        </form>

        <footer className="screen-footer">
          <p>
            By continuing, you agree to AgroAid&apos;s <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
          <p className="version">VERSION 2.4.0</p>
        </footer>
      </main>
    </div>
  );
}

function DashboardScreen({
  activeTab,
  onTabChange,
  onUploadClick,
  onFileChange,
  previewUrl,
  isAnalyzing,
  diagnosis,
  selectedFileName,
  isUploadModalOpen,
  onUploadModalClose,
  onPredictionComplete,
  sensorReadings,
  suggestions,
  alerts,
}) {
  const primarySensors = sensorReadings.slice(0, 4);
  const lightSensor = sensorReadings[4] || null;

  return (
    <div className="dashboard-shell">
      <main className="mobile-screen" role="main" aria-label="AgroAid home dashboard">
        <input
          className="hidden-input"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          id="crop-image-input"
        />

        <UploadPhotoModal
          isOpen={isUploadModalOpen}
          onClose={onUploadModalClose}
          onPredictionComplete={onPredictionComplete}
        />

        <header className="top-bar">
          <h1>AgroAid</h1>
        </header>

        {activeTab === "home" ? (
          <>
            <section className="welcome-row">
              <div>
                <p className="greeting">
                  Hello, Ramesh! <span aria-hidden="true">👋</span>
                </p>
                <p className="location-line">
                  Punjab, India <span aria-hidden="true">|</span> Harvesting Season
                </p>
              </div>

              <div className="avatar-wrap" aria-label="Ramesh online">
                <div className="avatar" aria-hidden="true" />
                <span className="online-dot" aria-hidden="true" />
              </div>
            </section>

            <section className="sensor-panel" aria-label="Farm sensor status">
              <div className="sensor-panel-head">
                <span className="mini-icon normal">IO</span>
                <h2>Farm Sensor Status</h2>
              </div>

              <div className="sensor-grid">
                {primarySensors.map((sensor) => (
                  <SensorCard key={sensor.id} {...sensor} />
                ))}
                {lightSensor ? <SensorCard {...lightSensor} wide /> : null}
              </div>
            </section>

            <HealthScoreCard onUploadClick={onUploadClick} />

            <section className="section-head activity-head">
              <h2>Farm Activity Suggestions</h2>
            </section>

            <section className="activity-list" aria-label="Farm activity suggestions">
              {suggestions.map((activity) => (
                <ActivitySuggestionCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  priority={activity.priority}
                  icon={activity.icon}
                />
              ))}
            </section>
          </>
        ) : null}

        {activeTab === "sensors" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>Live Sensor Readings</h2>
            </div>

            <section className="sensor-panel" aria-label="Detailed sensor status">
              <div className="sensor-grid">
                {sensorReadings.map((sensor) => (
                  <SensorCard key={sensor.id} {...sensor} wide={sensor.id === "light"} />
                ))}
              </div>
            </section>

            <p className="empty-copy">IoT streams refresh every 5 minutes. API connector can be attached to this panel later.</p>
          </section>
        ) : null}

        {activeTab === "upload" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>Upload Crop Image</h2>
            </div>
            <button type="button" className="upload-trigger" onClick={onUploadClick}>
              Select Crop Photo
            </button>

            {diagnosis && (
              <PredictionResultCard prediction={diagnosis} />
            )}

            {!diagnosis && (
              <p className="empty-copy">Click the button above and select an image to run AI diagnosis.</p>
            )}
          </section>
        ) : null}

        {activeTab === "alerts" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>Alert Feed</h2>
            </div>
            <section className="activity-list" aria-label="Farm alert feed">
              {alerts.map((alertItem) => (
                <AlertFeedCard
                  key={alertItem.id}
                  title={alertItem.title}
                  description={alertItem.description}
                  severity={alertItem.severity}
                  icon="AL"
                  time={alertItem.time}
                />
              ))}
            </section>
          </section>
        ) : null}

        {activeTab === "reports" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>Insurance Claim Assistant</h2>
            </div>
            <InsuranceClaimAssistant />
          </section>
        ) : null}

        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
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

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (sanitizedPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneError("");
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

  if (!isAuthenticated) {
    return (
      <LoginScreen
        phoneNumber={phoneNumber}
        onPhoneChange={(value) => {
          const nextValue = value.replace(/\D/g, "").slice(0, 10);
          setPhoneNumber(nextValue);
          if (phoneError) {
            setPhoneError("");
          }
        }}
        onSubmit={handleLoginSubmit}
        error={phoneError}
      />
    );
  }

  return (
    <DashboardScreen
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onUploadClick={openUploadModal}
      isUploadModalOpen={isUploadModalOpen}
      onUploadModalClose={closeUploadModal}
      onPredictionComplete={handlePredictionComplete}
      diagnosis={diagnosis}
      sensorReadings={sensorData}
      suggestions={suggestions}
      alerts={alerts}
    />
  );
}

export default App;
