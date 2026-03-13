import { useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  "Your Details",
  "Farm & Crop Details",
  "Damage Information",
  "Upload Evidence",
  "Verification",
  "Claim Summary",
];

const STEP_LABELS = ["Farmer", "Farm", "Damage", "Evidence", "Verify", "Review"];

const DAMAGE_TYPES = [
  { value: "flood", label: "Flood", icon: "🌊" },
  { value: "drought", label: "Drought", icon: "☀️" },
  { value: "pest_attack", label: "Pest Attack", icon: "🐛" },
  { value: "disease", label: "Disease", icon: "🦠" },
  { value: "heavy_rain", label: "Heavy Rain", icon: "🌧️" },
  { value: "hailstorm", label: "Hailstorm", icon: "🌨️" },
  { value: "other", label: "Other", icon: "⚠️" },
];

const CROP_STAGES = [
  { value: "sowing", label: "🌱 Sowing" },
  { value: "growing", label: "🪴 Growing" },
  { value: "flowering", label: "🌸 Flowering" },
  { value: "harvest_ready", label: "🌾 Harvest Ready" },
];

const INITIAL_FARMER = {
  name: "", mobile: "", village: "", district: "",
  state: "", aadhaarId: "", policyNumber: "",
};
const INITIAL_CROP = {
  cropName: "", cropStage: "", farmLocation: "",
  landAreaAffected: "", damageDate: "",
};
const INITIAL_DAMAGE = {
  damageType: "", percentageAffected: "", description: "", isOngoing: null,
};
const INITIAL_EVIDENCE = { cropPhotos: [], sensorSnapshot: null, fieldNotes: null };
const INITIAL_VERIFICATION = {
  withinPolicyTimeline: null,
  reportedBefore: null,
  entireFarmAffected: null,
  treatmentApplied: null,
};

function generateClaimId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `AGR-${year}-${random}`;
}

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
  return (
    <div className="ci-field">
      <label className="ci-field-label">
        {label}
        {required && <span className="ci-required">*</span>}
        {hint && <span className="ci-hint"> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function FieldError({ msg }) {
  return msg ? <p className="ci-error">{msg}</p> : null;
}

function YesNoRow({ value, onChange, yesLabel = "Yes", noLabel = "No" }) {
  return (
    <div className="ci-yn-row">
      <button
        type="button"
        className={`ci-yn-btn${value === true ? " ci-yn-yes" : ""}`}
        onClick={() => onChange(true)}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        className={`ci-yn-btn${value === false ? " ci-yn-no" : ""}`}
        onClick={() => onChange(false)}
      >
        {noLabel}
      </button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="ci-sum-row">
      <span className="ci-sum-label">{label}</span>
      <span className="ci-sum-value">{value || "—"}</span>
    </div>
  );
}

// ─── Step Progress Header ─────────────────────────────────────────────────────

function ClaimStepHeader({ step }) {
  return (
    <div className="ci-step-header">
      <div className="ci-progress-track" role="list" aria-label="Claim progress">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="ci-step-seg" role="listitem" aria-label={STEP_LABELS[i]}>
              <div
                className={`ci-dot ${done ? "ci-dot--done" : active ? "ci-dot--active" : "ci-dot--idle"}`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : n}
              </div>
              {n < TOTAL_STEPS && (
                <div className={`ci-connector ${done ? "ci-connector--done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="ci-step-label">
        Step {step} of {TOTAL_STEPS} —{" "}
        <strong>{STEP_TITLES[step - 1]}</strong>
      </p>
    </div>
  );
}

// ─── Step 1: Farmer Details ───────────────────────────────────────────────────

function FarmerDetailsForm({ data, onChange, errors }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="ci-form-body">
      <p className="ci-intro">Let's start with your basic information for the claim.</p>

      <Field label="Full Name" required>
        <input
          className={`ci-input${errors.name ? " ci-input--err" : ""}`}
          type="text"
          placeholder="e.g. Ramesh Kumar"
          value={data.name}
          onChange={set("name")}
          autoComplete="name"
        />
        <FieldError msg={errors.name} />
      </Field>

      <Field label="Mobile Number" required>
        <input
          className={`ci-input${errors.mobile ? " ci-input--err" : ""}`}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={data.mobile}
          onChange={(e) => onChange({ ...data, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          autoComplete="tel"
        />
        <FieldError msg={errors.mobile} />
      </Field>

      <div className="ci-row-2">
        <Field label="Village" required>
          <input
            className={`ci-input${errors.village ? " ci-input--err" : ""}`}
            type="text"
            placeholder="Village name"
            value={data.village}
            onChange={set("village")}
          />
          <FieldError msg={errors.village} />
        </Field>

        <Field label="District" required>
          <input
            className={`ci-input${errors.district ? " ci-input--err" : ""}`}
            type="text"
            placeholder="District"
            value={data.district}
            onChange={set("district")}
          />
          <FieldError msg={errors.district} />
        </Field>
      </div>

      <Field label="State" required>
        <input
          className={`ci-input${errors.state ? " ci-input--err" : ""}`}
          type="text"
          placeholder="e.g. Punjab"
          value={data.state}
          onChange={set("state")}
        />
        <FieldError msg={errors.state} />
      </Field>

      <Field label="Aadhaar / Farmer ID" hint="Optional — speeds up verification">
        <input
          className="ci-input"
          type="text"
          placeholder="Aadhaar or Farmer ID"
          value={data.aadhaarId}
          onChange={set("aadhaarId")}
        />
      </Field>

      <Field label="Insurance Policy Number" required>
        <input
          className={`ci-input${errors.policyNumber ? " ci-input--err" : ""}`}
          type="text"
          placeholder="e.g. PMFBY-2024-XXXXX"
          value={data.policyNumber}
          onChange={set("policyNumber")}
        />
        <FieldError msg={errors.policyNumber} />
      </Field>
    </div>
  );
}

// ─── Step 2: Crop Details ─────────────────────────────────────────────────────

function CropDetailsForm({ data, onChange, errors }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="ci-form-body">
      <p className="ci-intro">Tell us about your farm and the affected crop.</p>

      <Field label="Crop Name" required>
        <input
          className={`ci-input${errors.cropName ? " ci-input--err" : ""}`}
          type="text"
          placeholder="e.g. Wheat, Rice, Cotton"
          value={data.cropName}
          onChange={set("cropName")}
        />
        <FieldError msg={errors.cropName} />
      </Field>

      <Field label="Crop Stage" required>
        <div className="ci-stage-grid">
          {CROP_STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`ci-stage-chip${data.cropStage === s.value ? " selected" : ""}`}
              onClick={() => onChange({ ...data, cropStage: s.value })}
            >
              {s.label}
            </button>
          ))}
        </div>
        <FieldError msg={errors.cropStage} />
      </Field>

      <Field label="Farm Location / Survey Number" required>
        <input
          className={`ci-input${errors.farmLocation ? " ci-input--err" : ""}`}
          type="text"
          placeholder="e.g. Survey No. 42 or GPS coordinates"
          value={data.farmLocation}
          onChange={set("farmLocation")}
        />
        <FieldError msg={errors.farmLocation} />
      </Field>

      <Field label="Land Area Affected" required hint="in acres or hectares">
        <input
          className={`ci-input${errors.landAreaAffected ? " ci-input--err" : ""}`}
          type="text"
          placeholder="e.g. 2.5 acres"
          value={data.landAreaAffected}
          onChange={set("landAreaAffected")}
        />
        <FieldError msg={errors.landAreaAffected} />
      </Field>

      <Field label="Date Damage Was Noticed" required>
        <input
          className={`ci-input ci-input--date${errors.damageDate ? " ci-input--err" : ""}`}
          type="date"
          value={data.damageDate}
          onChange={set("damageDate")}
          max={new Date().toISOString().split("T")[0]}
        />
        <FieldError msg={errors.damageDate} />
      </Field>
    </div>
  );
}

// ─── Step 3: Damage Details ───────────────────────────────────────────────────

function DamageDetailsForm({ data, onChange, errors }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="ci-form-body">
      <p className="ci-intro">Describe the damage to your crop in detail.</p>

      <Field label="Type of Damage" required>
        <div className="ci-damage-grid">
          {DAMAGE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`ci-damage-chip${data.damageType === t.value ? " selected" : ""}`}
              onClick={() => onChange({ ...data, damageType: t.value })}
            >
              <span className="ci-damage-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <FieldError msg={errors.damageType} />
      </Field>

      <Field label="Percentage of Crop Affected" required hint="approximate">
        <div className="ci-pct-wrap">
          <input
            className={`ci-input ci-input--pct${errors.percentageAffected ? " ci-input--err" : ""}`}
            type="number"
            inputMode="numeric"
            min="1"
            max="100"
            placeholder="e.g. 60"
            value={data.percentageAffected}
            onChange={(e) => onChange({ ...data, percentageAffected: e.target.value })}
          />
          <span className="ci-pct-unit">%</span>
        </div>
        <FieldError msg={errors.percentageAffected} />
      </Field>

      <Field label="Describe What Happened" required>
        <textarea
          className={`ci-textarea${errors.description ? " ci-input--err" : ""}`}
          rows={4}
          placeholder="e.g. Heavy rains flooded the lower fields for 3 days starting on 5th March..."
          value={data.description}
          onChange={set("description")}
        />
        <FieldError msg={errors.description} />
      </Field>

      <Field label="Is the Damage Still Ongoing?" required>
        <YesNoRow
          value={data.isOngoing}
          onChange={(v) => onChange({ ...data, isOngoing: v })}
          yesLabel="Yes, still happening"
          noLabel="No, it has stopped"
        />
        <FieldError msg={errors.isOngoing} />
      </Field>
    </div>
  );
}

// ─── Step 4: Evidence Upload ──────────────────────────────────────────────────

function EvidenceUploadSection({ data, onChange }) {
  const cropPhotosRef = useRef(null);
  const sensorRef = useRef(null);
  const notesRef = useRef(null);

  const handleCropPhotos = (e) => {
    const previews = Array.from(e.target.files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    onChange({ ...data, cropPhotos: [...data.cropPhotos, ...previews] });
    e.target.value = "";
  };

  const removePhoto = (i) =>
    onChange({ ...data, cropPhotos: data.cropPhotos.filter((_, idx) => idx !== i) });

  const handleSingleFile = (key, e) => {
    const file = e.target.files[0];
    if (file) onChange({ ...data, [key]: { name: file.name } });
    e.target.value = "";
  };

  return (
    <div className="ci-form-body">
      <p className="ci-intro">Add photos and documents that support your claim.</p>

      <div className="ci-field">
        <label className="ci-field-label">
          Crop Photos <span className="ci-required">*</span>
        </label>
        <button
          type="button"
          className="ci-upload-btn"
          onClick={() => cropPhotosRef.current?.click()}
        >
          <span className="ci-upload-icon">📷</span>
          <span>Tap to add crop photos</span>
        </button>
        <input
          ref={cropPhotosRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden-input"
          onChange={handleCropPhotos}
        />
        {data.cropPhotos.length > 0 && (
          <div className="ci-photo-grid">
            {data.cropPhotos.map((p, i) => (
              <div key={i} className="ci-photo-item">
                <img src={p.url} alt={p.name} className="ci-photo-thumb" />
                <button
                  type="button"
                  className="ci-photo-remove"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                >
                  ✕
                </button>
                <p className="ci-photo-name">{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ci-field">
        <label className="ci-field-label">
          Sensor Report / Snapshot{" "}
          <span className="ci-optional">(Optional)</span>
        </label>
        <button
          type="button"
          className="ci-upload-btn ci-upload-btn--alt"
          onClick={() => sensorRef.current?.click()}
        >
          <span className="ci-upload-icon">📊</span>
          <span>{data.sensorSnapshot ? `✓ ${data.sensorSnapshot.name}` : "Upload sensor report"}</span>
        </button>
        <input
          ref={sensorRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.csv"
          className="hidden-input"
          onChange={(e) => handleSingleFile("sensorSnapshot", e)}
        />
      </div>

      <div className="ci-field">
        <label className="ci-field-label">
          Field Notes / Documents{" "}
          <span className="ci-optional">(Optional)</span>
        </label>
        <button
          type="button"
          className="ci-upload-btn ci-upload-btn--alt"
          onClick={() => notesRef.current?.click()}
        >
          <span className="ci-upload-icon">📄</span>
          <span>{data.fieldNotes ? `✓ ${data.fieldNotes.name}` : "Upload field notes or documents"}</span>
        </button>
        <input
          ref={notesRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg"
          className="hidden-input"
          onChange={(e) => handleSingleFile("fieldNotes", e)}
        />
      </div>
    </div>
  );
}

// ─── Step 5: Verification Questions ──────────────────────────────────────────

const VERIFY_QUESTIONS = [
  {
    key: "withinPolicyTimeline",
    text: "Is this damage reported within your policy's allowed time?",
    yes: "Yes, within timeline",
    no: "No / Not sure",
  },
  {
    key: "reportedBefore",
    text: "Has this damage been reported to the insurer before?",
    yes: "Yes, reported before",
    no: "No, first time",
  },
  {
    key: "entireFarmAffected",
    text: "Is the entire farm affected, or only one section?",
    yes: "Entire farm",
    no: "Only a section",
  },
  {
    key: "treatmentApplied",
    text: "Have you already applied any treatment to save the crop?",
    yes: "Yes, applied treatment",
    no: "Not yet",
  },
];

function VerificationForm({ data, onChange, errors }) {
  return (
    <div className="ci-form-body">
      <p className="ci-intro">A few quick questions to complete your claim information.</p>

      {VERIFY_QUESTIONS.map(({ key, text, yes, no }) => (
        <div key={key} className="ci-verify-card">
          <p className="ci-verify-q">{text}</p>
          <YesNoRow
            value={data[key]}
            onChange={(v) => onChange({ ...data, [key]: v })}
            yesLabel={yes}
            noLabel={no}
          />
          <FieldError msg={errors[key]} />
        </div>
      ))}
    </div>
  );
}

// ─── Step 6: Claim Summary ────────────────────────────────────────────────────

function ClaimSummaryCard({ formData, onSubmit, isSubmitting }) {
  const { farmer, crop, damage, evidence } = formData;

  const damageLabel = DAMAGE_TYPES.find((d) => d.value === damage.damageType)?.label || damage.damageType;
  const stageLabel = CROP_STAGES.find((s) => s.value === crop.cropStage)?.label || crop.cropStage;

  const missing = [];
  if (!farmer.name) missing.push("Farmer Name");
  if (!farmer.policyNumber) missing.push("Policy Number");
  if (!crop.cropName) missing.push("Crop Name");
  if (!damage.damageType) missing.push("Damage Type");
  if (!damage.description) missing.push("Damage Description");
  if (evidence.cropPhotos.length === 0) missing.push("At least one crop photo");

  const readiness = Math.max(10, 100 - missing.length * 16);

  return (
    <div className="ci-form-body">
      <p className="ci-intro">Review your claim details before submitting.</p>

      {missing.length > 0 && (
        <div className="ci-missing-banner" role="alert">
          <span className="ci-missing-icon">⚠️</span>
          <div>
            <p className="ci-missing-title">Some recommended fields are missing</p>
            <ul className="ci-missing-list">
              {missing.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="ci-sum-section">
        <p className="ci-sum-heading">Farmer Details</p>
        <SummaryRow label="Name" value={farmer.name} />
        <SummaryRow label="Mobile" value={farmer.mobile} />
        <SummaryRow
          label="Location"
          value={[farmer.village, farmer.district, farmer.state].filter(Boolean).join(", ")}
        />
        <SummaryRow label="Policy No." value={farmer.policyNumber} />
        {farmer.aadhaarId && <SummaryRow label="Aadhaar / ID" value={farmer.aadhaarId} />}
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">Farm &amp; Crop</p>
        <SummaryRow label="Crop" value={crop.cropName} />
        <SummaryRow label="Stage" value={stageLabel} />
        <SummaryRow label="Location" value={crop.farmLocation} />
        <SummaryRow label="Area Affected" value={crop.landAreaAffected} />
        <SummaryRow label="Date Noticed" value={crop.damageDate} />
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">Damage Details</p>
        <SummaryRow label="Type" value={damageLabel} />
        <SummaryRow
          label="Affected"
          value={damage.percentageAffected ? `${damage.percentageAffected}%` : ""}
        />
        <SummaryRow
          label="Ongoing"
          value={damage.isOngoing === true ? "Yes" : damage.isOngoing === false ? "No" : ""}
        />
        <SummaryRow label="Description" value={damage.description} />
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">Evidence</p>
        <SummaryRow
          label="Photos"
          value={`${evidence.cropPhotos.length} photo(s) uploaded`}
        />
        <SummaryRow
          label="Sensor Report"
          value={evidence.sensorSnapshot ? evidence.sensorSnapshot.name : "Not uploaded"}
        />
        <SummaryRow
          label="Field Notes"
          value={evidence.fieldNotes ? evidence.fieldNotes.name : "Not uploaded"}
        />
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">Claim Readiness</p>
        <div className="ci-readiness">
          <div className="ci-readiness-bar">
            <div className="ci-readiness-fill" style={{ width: `${readiness}%` }} />
          </div>
          <p className="ci-readiness-label">
            {missing.length === 0
              ? "Ready to submit ✓"
              : `${missing.length} recommended item(s) missing`}
          </p>
        </div>
      </div>

      <div className="ci-submit-area">
        <button
          type="button"
          className="ci-submit-btn"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="ci-submitting">
              <span className="ci-spinner" />
              Submitting claim…
            </span>
          ) : (
            "Submit to Insurance Company"
          )}
        </button>
        <p className="ci-submit-note">
          This will generate a claim reference ID and send your report.
        </p>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function ClaimSuccessScreen({ claimId, submittedAt, formData, onNewClaim }) {
  const { farmer, crop, damage } = formData;
  const damageLabel = DAMAGE_TYPES.find((d) => d.value === damage.damageType)?.label || damage.damageType;

  return (
    <div className="ci-success">
      <div className="ci-success-check" aria-hidden="true">✓</div>
      <h2 className="ci-success-title">Claim Submitted!</h2>
      <p className="ci-success-sub">
        Your insurance claim has been sent successfully. You will receive a confirmation SMS on{" "}
        <strong>{farmer.mobile}</strong>.
      </p>

      <div className="ci-id-card">
        <p className="ci-id-label">Claim Reference ID</p>
        <p className="ci-id-value">{claimId}</p>
        <p className="ci-id-time">Submitted: {submittedAt}</p>
      </div>

      <div className="ci-sum-section" style={{ width: "100%" }}>
        <p className="ci-sum-heading">Claim Report</p>
        <SummaryRow label="Farmer" value={farmer.name} />
        <SummaryRow label="Policy No." value={farmer.policyNumber} />
        <SummaryRow label="Crop" value={crop.cropName} />
        <SummaryRow label="Area" value={crop.landAreaAffected} />
        <SummaryRow label="Damage" value={damageLabel} />
        <SummaryRow label="Date Noticed" value={crop.damageDate} />
        <SummaryRow label="Claim ID" value={claimId} />
        <SummaryRow label="Submitted At" value={submittedAt} />
      </div>

      <button type="button" className="ci-new-btn" onClick={onNewClaim}>
        File Another Claim
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InsuranceClaimAssistant() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [claimId, setClaimId] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [farmer, setFarmer] = useState(INITIAL_FARMER);
  const [crop, setCrop] = useState(INITIAL_CROP);
  const [damage, setDamage] = useState(INITIAL_DAMAGE);
  const [evidence, setEvidence] = useState(INITIAL_EVIDENCE);
  const [verification, setVerification] = useState(INITIAL_VERIFICATION);
  const [errors, setErrors] = useState({});

  const formData = { farmer, crop, damage, evidence, verification };

  const validate = () => {
    const e = {};

    if (step === 1) {
      if (!farmer.name.trim()) e.name = "Please enter your full name.";
      if (farmer.mobile.length !== 10) e.mobile = "Enter a valid 10-digit mobile number.";
      if (!farmer.village.trim()) e.village = "Village is required.";
      if (!farmer.district.trim()) e.district = "District is required.";
      if (!farmer.state.trim()) e.state = "State is required.";
      if (!farmer.policyNumber.trim()) e.policyNumber = "Policy number is required.";
    }

    if (step === 2) {
      if (!crop.cropName.trim()) e.cropName = "Crop name is required.";
      if (!crop.cropStage) e.cropStage = "Please select the crop stage.";
      if (!crop.farmLocation.trim()) e.farmLocation = "Farm location is required.";
      if (!crop.landAreaAffected.trim()) e.landAreaAffected = "Land area is required.";
      if (!crop.damageDate) e.damageDate = "Please enter the date damage was noticed.";
    }

    if (step === 3) {
      if (!damage.damageType) e.damageType = "Please select the type of damage.";
      const pct = Number(damage.percentageAffected);
      if (!damage.percentageAffected || pct < 1 || pct > 100)
        e.percentageAffected = "Enter a valid percentage (1–100).";
      if (!damage.description.trim()) e.description = "Please describe what happened.";
      if (damage.isOngoing === null) e.isOngoing = "Please select an option.";
    }

    if (step === 5) {
      if (verification.withinPolicyTimeline === null) e.withinPolicyTimeline = "Please answer this question.";
      if (verification.reportedBefore === null) e.reportedBefore = "Please answer this question.";
      if (verification.entireFarmAffected === null) e.entireFarmAffected = "Please answer this question.";
      if (verification.treatmentApplied === null) e.treatmentApplied = "Please answer this question.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Mock insurance API call
    setTimeout(() => {
      const id = generateClaimId();
      const at = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setClaimId(id);
      setSubmittedAt(at);
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1800);
  };

  const handleNewClaim = () => {
    setStep(1);
    setSubmitted(false);
    setClaimId(null);
    setSubmittedAt(null);
    setFarmer(INITIAL_FARMER);
    setCrop(INITIAL_CROP);
    setDamage(INITIAL_DAMAGE);
    setEvidence(INITIAL_EVIDENCE);
    setVerification(INITIAL_VERIFICATION);
    setErrors({});
  };

  if (submitted) {
    return (
      <ClaimSuccessScreen
        claimId={claimId}
        submittedAt={submittedAt}
        formData={formData}
        onNewClaim={handleNewClaim}
      />
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <FarmerDetailsForm data={farmer} onChange={setFarmer} errors={errors} />;
      case 2: return <CropDetailsForm data={crop} onChange={setCrop} errors={errors} />;
      case 3: return <DamageDetailsForm data={damage} onChange={setDamage} errors={errors} />;
      case 4: return <EvidenceUploadSection data={evidence} onChange={setEvidence} />;
      case 5: return <VerificationForm data={verification} onChange={setVerification} errors={errors} />;
      case 6: return (
        <ClaimSummaryCard
          formData={formData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="ci-container">
      <ClaimStepHeader step={step} />

      <div className="ci-card">
        {renderStep()}
      </div>

      {step < 6 && (
        <div className="ci-nav-row">
          {step > 1 ? (
            <button type="button" className="ci-back-btn" onClick={handleBack}>
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button type="button" className="ci-next-btn" onClick={handleNext}>
            {step === 5 ? "Review Claim →" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
