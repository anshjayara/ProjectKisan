import { useEffect, useMemo, useRef, useState } from "react";

const SENSOR_READINGS = [
  { id: "moisture", label: "Soil Moisture", value: "32", unit: "%", status: "normal", icon: "SM" },
  { id: "temperature", label: "Temperature", value: "27", unit: "deg C", status: "warning", icon: "TP" },
  { id: "humidity", label: "Humidity", value: "72", unit: "%", status: "warning", icon: "HM" },
  { id: "ph", label: "Soil pH", value: "6.4", unit: "", status: "normal", icon: "PH" },
  { id: "light", label: "Light Intensity", value: "High", unit: "", status: "normal", icon: "LT" },
];

const SMART_ACTIONS = [
  { title: "Upload Crop Image", subtitle: "AI diagnosis", icon: "UP" },
  { title: "Risk Alerts", subtitle: "Sensor and weather", icon: "RA" },
  { title: "Damage Report", subtitle: "Insurance aid", icon: "DR" },
  { title: "Farm Analytics", subtitle: "Sensor trends", icon: "FA" },
];

const ALERT_FEED = [
  {
    id: "fungal",
    title: "Fungal Disease Risk",
    description: "Humidity above 80% for 12 hrs. Fungal infection likely.",
    time: "1 hour ago",
    tone: "warning",
    icon: "FG",
  },
  {
    id: "rain",
    title: "Heavy Rain Warning",
    description: "Rain expected tomorrow. Plan to protect crops and drainage.",
    time: "3 hours ago",
    tone: "info",
    icon: "RN",
  },
  {
    id: "soil",
    title: "Low Soil Moisture",
    description: "Zone B moisture dropped under threshold. Irrigation advised.",
    time: "6 hours ago",
    tone: "critical",
    icon: "MS",
  },
];

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

function ActionCard({ title, subtitle, icon, onClick }) {
  return (
    <button type="button" className="action-card" onClick={onClick}>
      <span className="mini-icon normal">{icon}</span>
      <span className="action-copy">
        <span className="action-title">{title}</span>
        <span className="action-subtitle">{subtitle}</span>
      </span>
    </button>
  );
}

function AlertCard({ title, description, time, tone, icon }) {
  return (
    <article className="feed-alert-card">
      <span className={`alert-badge ${tone}`}>{icon}</span>
      <div className="feed-alert-content">
        <p className="feed-alert-title">{title}</p>
        <p className="feed-alert-description">{description}</p>
      </div>
      <span className="feed-alert-time">{time}</span>
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
}) {
  const onActionClick = (title) => {
    if (title === "Upload Crop Image") {
      onTabChange("upload");
      onUploadClick();
      return;
    }
    if (title === "Risk Alerts") {
      onTabChange("alerts");
      return;
    }
    if (title === "Farm Analytics") {
      onTabChange("sensors");
      return;
    }
    onTabChange("reports");
  };

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
                {SENSOR_READINGS.slice(0, 4).map((sensor) => (
                  <SensorCard key={sensor.id} {...sensor} />
                ))}
                <SensorCard {...SENSOR_READINGS[4]} wide />
              </div>
            </section>

            <HealthScoreCard onUploadClick={onUploadClick} />

            <section className="section-head actions-head">
              <h2>Smart Actions</h2>
              <button type="button" className="link-button" onClick={() => onTabChange("sensors")}>
                View All
              </button>
            </section>

            <section className="actions-grid" aria-label="Smart actions">
              {SMART_ACTIONS.map((action) => (
                <ActionCard
                  key={action.title}
                  title={action.title}
                  subtitle={action.subtitle}
                  icon={action.icon}
                  onClick={() => onActionClick(action.title)}
                />
              ))}
            </section>

            <section className="section-head alerts-head">
              <h2>Recent Alerts</h2>
              <button type="button" className="link-button" onClick={() => onTabChange("alerts")}>
                View All
              </button>
            </section>

            <section className="feed-list" aria-label="Recent alerts">
              {ALERT_FEED.map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.title}
                  description={alert.description}
                  time={alert.time}
                  tone={alert.tone}
                  icon={alert.icon}
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
                {SENSOR_READINGS.map((sensor) => (
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

            {previewUrl ? (
              <div className="preview-card">
                <img src={previewUrl} alt="Selected crop" className="upload-preview" />
              </div>
            ) : (
              <p className="empty-copy">Choose an image to run a mock diagnosis.</p>
            )}

            {isAnalyzing ? <p className="analyzing-copy">Analyzing image...</p> : null}
            <DiagnosisResultCard diagnosis={diagnosis} selectedFileName={selectedFileName} />
          </section>
        ) : null}

        {activeTab === "alerts" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>Alerts Feed</h2>
            </div>
            <section className="feed-list" aria-label="All alerts">
              {ALERT_FEED.map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.title}
                  description={alert.description}
                  time={alert.time}
                  tone={alert.tone}
                  icon={alert.icon}
                />
              ))}
            </section>
          </section>
        ) : null}

        {activeTab === "reports" ? (
          <section className="tab-panel">
            <div className="section-head upload-head">
              <h2>Damage Reports</h2>
            </div>
            <p className="empty-copy">Insurance-ready damage reports will appear here after field submissions.</p>
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
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const diagnosisTimerRef = useRef(null);

  const sanitizedPhone = useMemo(() => phoneNumber.replace(/\D/g, ""), [phoneNumber]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (diagnosisTimerRef.current) {
        clearTimeout(diagnosisTimerRef.current);
      }
    };
  }, [previewUrl]);

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

  const openUploadPicker = () => {
    const input = document.getElementById("crop-image-input");
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    setSelectedFileName(file.name);
    setDiagnosis(null);
    setIsAnalyzing(true);
    setActiveTab("upload");

    if (diagnosisTimerRef.current) {
      clearTimeout(diagnosisTimerRef.current);
    }

    diagnosisTimerRef.current = setTimeout(() => {
      setDiagnosis(runMockDiagnosis(file));
      setIsAnalyzing(false);
    }, 700);
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
      onUploadClick={openUploadPicker}
      onFileChange={handleFileChange}
      previewUrl={previewUrl}
      isAnalyzing={isAnalyzing}
      diagnosis={diagnosis}
      selectedFileName={selectedFileName}
    />
  );
}

export default App;
