import { useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const TOTAL_STEPS = 6;

const STEP_TITLE_KEYS = [
  "claim.yourDetails",
  "claim.farmAndCropDetails",
  "claim.damageInformation",
  "claim.uploadEvidence",
  "claim.verification",
  "claim.claimSummary",
];

const STEP_LABEL_KEYS = [
  "claim.stepLabelFarmer",
  "claim.stepLabelFarm",
  "claim.stepLabelDamage",
  "claim.stepLabelEvidence",
  "claim.stepLabelVerify",
  "claim.stepLabelReview",
];

const DAMAGE_TYPES = [
  { value: "flood", labelKey: "claim.damageTypes.flood", icon: "🌊" },
  { value: "drought", labelKey: "claim.damageTypes.drought", icon: "☀️" },
  { value: "pest_attack", labelKey: "claim.damageTypes.pest_attack", icon: "🐛" },
  { value: "disease", labelKey: "claim.damageTypes.disease", icon: "🦠" },
  { value: "heavy_rain", labelKey: "claim.damageTypes.heavy_rain", icon: "🌧️" },
  { value: "hailstorm", labelKey: "claim.damageTypes.hailstorm", icon: "🌨️" },
  { value: "other", labelKey: "claim.damageTypes.other", icon: "⚠️" },
];

const CROP_STAGES = [
  { value: "sowing", labelKey: "claim.cropStages.sowing", icon: "🌱" },
  { value: "growing", labelKey: "claim.cropStages.growing", icon: "🪴" },
  { value: "flowering", labelKey: "claim.cropStages.flowering", icon: "🌸" },
  { value: "harvest_ready", labelKey: "claim.cropStages.harvest_ready", icon: "🌾" },
];

const VERIFY_QUESTIONS = [
  {
    key: "withinPolicyTimeline",
    textKey: "claim.verifyWithinTime",
    yesKey: "claim.verifyWithinTimeYes",
    noKey: "claim.verifyWithinTimeNo",
  },
  {
    key: "reportedBefore",
    textKey: "claim.verifyReportedBefore",
    yesKey: "claim.verifyReportedBeforeYes",
    noKey: "claim.verifyReportedBeforeNo",
  },
  {
    key: "entireFarmAffected",
    textKey: "claim.verifyEntireFarm",
    yesKey: "claim.verifyEntireFarmYes",
    noKey: "claim.verifyEntireFarmNo",
  },
  {
    key: "treatmentApplied",
    textKey: "claim.verifyTreatment",
    yesKey: "claim.verifyTreatmentYes",
    noKey: "claim.verifyTreatmentNo",
  },
];

const INITIAL_FARMER = {
  name: "",
  mobile: "",
  village: "",
  district: "",
  state: "",
  aadhaarId: "",
  policyNumber: "",
};

const INITIAL_CROP = {
  cropName: "",
  cropStage: "",
  farmLocation: "",
  landAreaAffected: "",
  damageDate: "",
};

const INITIAL_DAMAGE = {
  damageType: "",
  percentageAffected: "",
  description: "",
  isOngoing: null,
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

function Field({ label, required, hint, children }) {
  return (
    <div className="ci-field">
      <label className="ci-field-label">
        {label}
        {required && <span className="ci-required">*</span>}
        {hint && <span className="ci-hint"> - {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function FieldError({ msg }) {
  return msg ? <p className="ci-error">{msg}</p> : null;
}

function YesNoRow({ value, onChange, yesLabel, noLabel }) {
  return (
    <div className="ci-yn-row">
      <button
        type="button"
        className={`ci-yn-btn ci-yn-yes${value === true ? " selected" : ""}`}
        onClick={() => onChange(true)}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        className={`ci-yn-btn ci-yn-no${value === false ? " selected" : ""}`}
        onClick={() => onChange(false)}
      >
        {noLabel}
      </button>
    </div>
  );
}

function SummaryRow({ label, value, t }) {
  return (
    <div className="ci-sum-row">
      <span className="ci-sum-label">{label}</span>
      <span className="ci-sum-value">{value || t("common.notAvailable")}</span>
    </div>
  );
}

function ClaimStepHeader({ step, t }) {
  return (
    <div className="ci-step-header">
      <div className="ci-progress-track" role="list" aria-label={t("claim.progressAria")}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="ci-step-seg" role="listitem" aria-label={t(STEP_LABEL_KEYS[i])}>
              <div
                className={`ci-dot ${done ? "ci-dot--done" : active ? "ci-dot--active" : "ci-dot--idle"}`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : n}
              </div>
              {n < TOTAL_STEPS && <div className={`ci-connector ${done ? "ci-connector--done" : ""}`} />}
            </div>
          );
        })}
      </div>
      <p className="ci-step-label">
        {t("claim.stepText", {
          step,
          total: TOTAL_STEPS,
          title: t(STEP_TITLE_KEYS[step - 1]),
        })}
      </p>
    </div>
  );
}

function FarmerDetailsForm({ data, onChange, errors, t }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="ci-form-body">
      <p className="ci-intro">{t("claim.introFarmer")}</p>

      <Field label={t("claim.fullName")} required>
        <input
          className={`ci-input${errors.name ? " ci-input--err" : ""}`}
          type="text"
          placeholder={t("claim.fullNamePlaceholder")}
          value={data.name}
          onChange={set("name")}
          autoComplete="name"
        />
        <FieldError msg={errors.name} />
      </Field>

      <Field label={t("claim.mobile")} required>
        <input
          className={`ci-input${errors.mobile ? " ci-input--err" : ""}`}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder={t("claim.mobilePlaceholder")}
          value={data.mobile}
          onChange={(e) => onChange({ ...data, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          autoComplete="tel"
        />
        <FieldError msg={errors.mobile} />
      </Field>

      <div className="ci-row-2">
        <Field label={t("claim.village")} required>
          <input
            className={`ci-input${errors.village ? " ci-input--err" : ""}`}
            type="text"
            placeholder={t("claim.villagePlaceholder")}
            value={data.village}
            onChange={set("village")}
          />
          <FieldError msg={errors.village} />
        </Field>

        <Field label={t("claim.district")} required>
          <input
            className={`ci-input${errors.district ? " ci-input--err" : ""}`}
            type="text"
            placeholder={t("claim.districtPlaceholder")}
            value={data.district}
            onChange={set("district")}
          />
          <FieldError msg={errors.district} />
        </Field>
      </div>

      <Field label={t("claim.state")} required>
        <input
          className={`ci-input${errors.state ? " ci-input--err" : ""}`}
          type="text"
          placeholder={t("claim.statePlaceholder")}
          value={data.state}
          onChange={set("state")}
        />
        <FieldError msg={errors.state} />
      </Field>

      <Field label={t("claim.aadhaar")} hint={t("claim.aadhaarHint")}>
        <input
          className="ci-input"
          type="text"
          placeholder={t("claim.aadhaarPlaceholder")}
          value={data.aadhaarId}
          onChange={set("aadhaarId")}
        />
      </Field>

      <Field label={t("claim.policyNumber")} required>
        <input
          className={`ci-input${errors.policyNumber ? " ci-input--err" : ""}`}
          type="text"
          placeholder={t("claim.policyPlaceholder")}
          value={data.policyNumber}
          onChange={set("policyNumber")}
        />
        <FieldError msg={errors.policyNumber} />
      </Field>
    </div>
  );
}

function CropDetailsForm({ data, onChange, errors, t }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="ci-form-body">
      <p className="ci-intro">{t("claim.introCrop")}</p>

      <Field label={t("claim.cropName")} required>
        <input
          className={`ci-input${errors.cropName ? " ci-input--err" : ""}`}
          type="text"
          placeholder={t("claim.cropNamePlaceholder")}
          value={data.cropName}
          onChange={set("cropName")}
        />
        <FieldError msg={errors.cropName} />
      </Field>

      <Field label={t("claim.cropStage")} required>
        <div className="ci-stage-grid">
          {CROP_STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`ci-stage-chip${data.cropStage === s.value ? " selected" : ""}`}
              onClick={() => onChange({ ...data, cropStage: s.value })}
            >
              {s.icon} {t(s.labelKey)}
            </button>
          ))}
        </div>
        <FieldError msg={errors.cropStage} />
      </Field>

      <Field label={t("claim.farmLocation")} required>
        <input
          className={`ci-input${errors.farmLocation ? " ci-input--err" : ""}`}
          type="text"
          placeholder={t("claim.farmLocationPlaceholder")}
          value={data.farmLocation}
          onChange={set("farmLocation")}
        />
        <FieldError msg={errors.farmLocation} />
      </Field>

      <Field label={t("claim.landArea")} required hint={t("claim.landAreaHint")}>
        <input
          className={`ci-input${errors.landAreaAffected ? " ci-input--err" : ""}`}
          type="text"
          placeholder={t("claim.landAreaPlaceholder")}
          value={data.landAreaAffected}
          onChange={set("landAreaAffected")}
        />
        <FieldError msg={errors.landAreaAffected} />
      </Field>

      <Field label={t("claim.dateNoticed")} required>
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

function DamageDetailsForm({ data, onChange, errors, t }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="ci-form-body">
      <p className="ci-intro">{t("claim.introDamage")}</p>

      <Field label={t("claim.damageType")} required>
        <div className="ci-damage-grid">
          {DAMAGE_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`ci-damage-chip${data.damageType === item.value ? " selected" : ""}`}
              onClick={() => onChange({ ...data, damageType: item.value })}
            >
              <span className="ci-damage-icon">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </div>
        <FieldError msg={errors.damageType} />
      </Field>

      <Field label={t("claim.percentageAffected")} required hint={t("claim.percentageHint")}>
        <div className="ci-pct-wrap">
          <input
            className={`ci-input ci-input--pct${errors.percentageAffected ? " ci-input--err" : ""}`}
            type="number"
            inputMode="numeric"
            min="1"
            max="100"
            placeholder={t("claim.percentagePlaceholder")}
            value={data.percentageAffected}
            onChange={(e) => onChange({ ...data, percentageAffected: e.target.value })}
          />
          <span className="ci-pct-unit">%</span>
        </div>
        <FieldError msg={errors.percentageAffected} />
      </Field>

      <Field label={t("claim.description")} required>
        <textarea
          className={`ci-textarea${errors.description ? " ci-input--err" : ""}`}
          rows={4}
          placeholder={t("claim.descriptionPlaceholder")}
          value={data.description}
          onChange={set("description")}
        />
        <FieldError msg={errors.description} />
      </Field>

      <Field label={t("claim.isOngoing")} required>
        <YesNoRow
          value={data.isOngoing}
          onChange={(v) => onChange({ ...data, isOngoing: v })}
          yesLabel={t("claim.yesStill")}
          noLabel={t("claim.noStopped")}
        />
        <FieldError msg={errors.isOngoing} />
      </Field>
    </div>
  );
}

function EvidenceUploadSection({ data, onChange, t }) {
  const cropPhotosRef = useRef(null);
  const sensorRef = useRef(null);
  const notesRef = useRef(null);

  const handleCropPhotos = (e) => {
    const previews = Array.from(e.target.files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    onChange({ ...data, cropPhotos: [...data.cropPhotos, ...previews] });
    e.target.value = "";
  };

  const removePhoto = (index) => {
    onChange({ ...data, cropPhotos: data.cropPhotos.filter((_, i) => i !== index) });
  };

  const handleSingleFile = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      onChange({ ...data, [key]: { name: file.name } });
    }
    e.target.value = "";
  };

  return (
    <div className="ci-form-body">
      <p className="ci-intro">{t("claim.introEvidence")}</p>

      <div className="ci-field">
        <label className="ci-field-label">
          {t("claim.cropPhotos")} <span className="ci-required">*</span>
        </label>
        <button
          type="button"
          className="ci-upload-btn"
          onClick={() => cropPhotosRef.current?.click()}
        >
          <span className="ci-upload-icon">📷</span>
          <span>{t("claim.tapAddPhotos")}</span>
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
            {data.cropPhotos.map((photo, index) => (
              <div key={`${photo.name}-${index}`} className="ci-photo-item">
                <img src={photo.url} alt={photo.name} className="ci-photo-thumb" />
                <button
                  type="button"
                  className="ci-photo-remove"
                  onClick={() => removePhoto(index)}
                  aria-label={t("claim.removePhotoAria")}
                >
                  ✕
                </button>
                <p className="ci-photo-name">{photo.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ci-field">
        <label className="ci-field-label">
          {t("claim.sensorReport")} <span className="ci-optional">({t("common.optional")})</span>
        </label>
        <button
          type="button"
          className="ci-upload-btn ci-upload-btn--alt"
          onClick={() => sensorRef.current?.click()}
        >
          <span className="ci-upload-icon">📊</span>
          <span>{data.sensorSnapshot ? `✓ ${data.sensorSnapshot.name}` : t("claim.uploadSensorReport")}</span>
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
          {t("claim.fieldNotes")} <span className="ci-optional">({t("common.optional")})</span>
        </label>
        <button
          type="button"
          className="ci-upload-btn ci-upload-btn--alt"
          onClick={() => notesRef.current?.click()}
        >
          <span className="ci-upload-icon">📄</span>
          <span>{data.fieldNotes ? `✓ ${data.fieldNotes.name}` : t("claim.uploadFieldNotes")}</span>
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

function VerificationForm({ data, onChange, errors, t }) {
  return (
    <div className="ci-form-body">
      <p className="ci-intro">{t("claim.introVerify")}</p>

      {VERIFY_QUESTIONS.map((question) => (
        <div key={question.key} className="ci-verify-card">
          <p className="ci-verify-q">{t(question.textKey)}</p>
          <YesNoRow
            value={data[question.key]}
            onChange={(value) => onChange({ ...data, [question.key]: value })}
            yesLabel={t(question.yesKey)}
            noLabel={t(question.noKey)}
          />
          <FieldError msg={errors[question.key]} />
        </div>
      ))}
    </div>
  );
}

function ClaimSummaryCard({ formData, onSubmit, isSubmitting, t }) {
  const { farmer, crop, damage, evidence } = formData;

  const damageLabel = DAMAGE_TYPES.find((item) => item.value === damage.damageType)
    ? t(DAMAGE_TYPES.find((item) => item.value === damage.damageType).labelKey)
    : damage.damageType;

  const stageLabel = CROP_STAGES.find((item) => item.value === crop.cropStage)
    ? t(CROP_STAGES.find((item) => item.value === crop.cropStage).labelKey)
    : crop.cropStage;

  const missing = [];
  if (!farmer.name) missing.push(t("claim.missing.farmerName"));
  if (!farmer.policyNumber) missing.push(t("claim.missing.policyNumber"));
  if (!crop.cropName) missing.push(t("claim.missing.cropName"));
  if (!damage.damageType) missing.push(t("claim.missing.damageType"));
  if (!damage.description) missing.push(t("claim.missing.damageDescription"));
  if (evidence.cropPhotos.length === 0) missing.push(t("claim.missing.onePhoto"));

  const readiness = Math.max(10, 100 - missing.length * 16);

  return (
    <div className="ci-form-body">
      <p className="ci-intro">{t("claim.introSummary")}</p>

      {missing.length > 0 && (
        <div className="ci-missing-banner" role="alert">
          <span className="ci-missing-icon">⚠️</span>
          <div>
            <p className="ci-missing-title">{t("claim.missingFieldsTitle")}</p>
            <ul className="ci-missing-list">
              {missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="ci-sum-section">
        <p className="ci-sum-heading">{t("claim.sectionFarmer")}</p>
        <SummaryRow label={t("claim.name")} value={farmer.name} t={t} />
        <SummaryRow label={t("claim.mobile")} value={farmer.mobile} t={t} />
        <SummaryRow
          label={t("claim.location")}
          value={[farmer.village, farmer.district, farmer.state].filter(Boolean).join(", ")}
          t={t}
        />
        <SummaryRow label={t("claim.policyNo")} value={farmer.policyNumber} t={t} />
        {farmer.aadhaarId ? <SummaryRow label={t("claim.aadhaar")} value={farmer.aadhaarId} t={t} /> : null}
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">{t("claim.sectionFarm")}</p>
        <SummaryRow label={t("claim.cropName")} value={crop.cropName} t={t} />
        <SummaryRow label={t("claim.stage")} value={stageLabel} t={t} />
        <SummaryRow label={t("claim.location")} value={crop.farmLocation} t={t} />
        <SummaryRow label={t("claim.areaAffected")} value={crop.landAreaAffected} t={t} />
        <SummaryRow label={t("claim.dateNoticed")} value={crop.damageDate} t={t} />
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">{t("claim.sectionDamage")}</p>
        <SummaryRow label={t("claim.type")} value={damageLabel} t={t} />
        <SummaryRow
          label={t("claim.affected")}
          value={damage.percentageAffected ? `${damage.percentageAffected}%` : ""}
          t={t}
        />
        <SummaryRow
          label={t("claim.ongoing")}
          value={damage.isOngoing === true ? t("common.yes") : damage.isOngoing === false ? t("common.no") : ""}
          t={t}
        />
        <SummaryRow label={t("claim.description")} value={damage.description} t={t} />
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">{t("claim.sectionEvidence")}</p>
        <SummaryRow
          label={t("claim.photos")}
          value={t("claim.photosUploaded", { count: evidence.cropPhotos.length })}
          t={t}
        />
        <SummaryRow
          label={t("claim.sensorReport")}
          value={evidence.sensorSnapshot ? evidence.sensorSnapshot.name : t("claim.notUploaded")}
          t={t}
        />
        <SummaryRow
          label={t("claim.fieldNotes")}
          value={evidence.fieldNotes ? evidence.fieldNotes.name : t("claim.notUploaded")}
          t={t}
        />
      </div>

      <div className="ci-sum-section">
        <p className="ci-sum-heading">{t("claim.sectionReadiness")}</p>
        <div className="ci-readiness">
          <div className="ci-readiness-bar">
            <div className="ci-readiness-fill" style={{ width: `${readiness}%` }} />
          </div>
          <p className="ci-readiness-label">
            {missing.length === 0 ? t("claim.readyToSubmit") : t("claim.missingItems", { count: missing.length })}
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
              {t("claim.submitting")}
            </span>
          ) : (
            t("claim.submitInsurance")
          )}
        </button>
        <p className="ci-submit-note">{t("claim.submitNote")}</p>
      </div>
    </div>
  );
}

function ClaimSuccessScreen({ claimId, submittedAt, formData, onNewClaim, t }) {
  const { farmer, crop, damage } = formData;
  const damageLabel = DAMAGE_TYPES.find((item) => item.value === damage.damageType)
    ? t(DAMAGE_TYPES.find((item) => item.value === damage.damageType).labelKey)
    : damage.damageType;

  return (
    <div className="ci-success">
      <div className="ci-success-check" aria-hidden="true">✓</div>
      <h2 className="ci-success-title">{t("claim.claimSubmitted")}</h2>
      <p className="ci-success-sub">{t("claim.successMessage", { phone: farmer.mobile })}</p>

      <div className="ci-id-card">
        <p className="ci-id-label">{t("claim.claimReferenceId")}</p>
        <p className="ci-id-value">{claimId}</p>
        <p className="ci-id-time">{t("claim.submittedAt", { time: submittedAt })}</p>
      </div>

      <div className="ci-sum-section" style={{ width: "100%" }}>
        <p className="ci-sum-heading">{t("claim.claimReport")}</p>
        <SummaryRow label={t("claim.farmer")} value={farmer.name} t={t} />
        <SummaryRow label={t("claim.policyNo")} value={farmer.policyNumber} t={t} />
        <SummaryRow label={t("claim.cropName")} value={crop.cropName} t={t} />
        <SummaryRow label={t("claim.area")} value={crop.landAreaAffected} t={t} />
        <SummaryRow label={t("claim.damageType")} value={damageLabel} t={t} />
        <SummaryRow label={t("claim.dateNoticed")} value={crop.damageDate} t={t} />
        <SummaryRow label={t("claim.claimId")} value={claimId} t={t} />
        <SummaryRow label={t("claim.submittedAtLabel")} value={submittedAt} t={t} />
      </div>

      <button type="button" className="ci-new-btn" onClick={onNewClaim}>
        {t("claim.fileAnotherClaim")}
      </button>
    </div>
  );
}

export default function InsuranceClaimAssistant() {
  const { t, language } = useLanguage();

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
    const nextErrors = {};

    if (step === 1) {
      if (!farmer.name.trim()) nextErrors.name = t("claim.errors.fullName");
      if (farmer.mobile.length !== 10) nextErrors.mobile = t("claim.errors.validMobile");
      if (!farmer.village.trim()) nextErrors.village = t("claim.errors.villageRequired");
      if (!farmer.district.trim()) nextErrors.district = t("claim.errors.districtRequired");
      if (!farmer.state.trim()) nextErrors.state = t("claim.errors.stateRequired");
      if (!farmer.policyNumber.trim()) nextErrors.policyNumber = t("claim.errors.policyRequired");
    }

    if (step === 2) {
      if (!crop.cropName.trim()) nextErrors.cropName = t("claim.errors.cropRequired");
      if (!crop.cropStage) nextErrors.cropStage = t("claim.errors.stageRequired");
      if (!crop.farmLocation.trim()) nextErrors.farmLocation = t("claim.errors.farmLocationRequired");
      if (!crop.landAreaAffected.trim()) nextErrors.landAreaAffected = t("claim.errors.landAreaRequired");
      if (!crop.damageDate) nextErrors.damageDate = t("claim.errors.dateRequired");
    }

    if (step === 3) {
      if (!damage.damageType) nextErrors.damageType = t("claim.errors.damageTypeRequired");
      const percentage = Number(damage.percentageAffected);
      if (!damage.percentageAffected || percentage < 1 || percentage > 100) {
        nextErrors.percentageAffected = t("claim.errors.validPercentage");
      }
      if (!damage.description.trim()) nextErrors.description = t("claim.errors.describeDamage");
      if (damage.isOngoing === null) nextErrors.isOngoing = t("claim.errors.selectOption");
    }

    if (step === 5) {
      if (verification.withinPolicyTimeline === null) nextErrors.withinPolicyTimeline = t("claim.errors.answerQuestion");
      if (verification.reportedBefore === null) nextErrors.reportedBefore = t("claim.errors.answerQuestion");
      if (verification.entireFarmAffected === null) nextErrors.entireFarmAffected = t("claim.errors.answerQuestion");
      if (verification.treatmentApplied === null) nextErrors.treatmentApplied = t("claim.errors.answerQuestion");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) {
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const id = generateClaimId();
      const at = new Date().toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
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
        t={t}
      />
    );
  }

  const renderStep = () => {
    if (step === 1) return <FarmerDetailsForm data={farmer} onChange={setFarmer} errors={errors} t={t} />;
    if (step === 2) return <CropDetailsForm data={crop} onChange={setCrop} errors={errors} t={t} />;
    if (step === 3) return <DamageDetailsForm data={damage} onChange={setDamage} errors={errors} t={t} />;
    if (step === 4) return <EvidenceUploadSection data={evidence} onChange={setEvidence} t={t} />;
    if (step === 5) return <VerificationForm data={verification} onChange={setVerification} errors={errors} t={t} />;
    return <ClaimSummaryCard formData={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} t={t} />;
  };

  return (
    <div className="ci-container">
      <ClaimStepHeader step={step} t={t} />

      <div className="ci-card">
        {renderStep()}
      </div>

      {step < 6 ? (
        <div className="ci-nav-row">
          {step > 1 ? (
            <button type="button" className="ci-back-btn" onClick={handleBack}>
              {t("claim.back")}
            </button>
          ) : (
            <div />
          )}
          <button type="button" className="ci-next-btn" onClick={handleNext}>
            {step === 5 ? t("claim.reviewClaim") : t("claim.next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
