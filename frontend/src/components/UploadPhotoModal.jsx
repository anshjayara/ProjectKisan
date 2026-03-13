import { useRef, useState } from "react";
import { predictImage } from "../api/prediction";
import { useLanguage } from "../context/LanguageContext";

/**
 * UploadPhotoModal Component
 * Handles image selection, preview, and prediction request
 */
function UploadPhotoModal({ isOpen, onClose, onPredictionComplete }) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorKey("upload.invalidFileError");
      return;
    }

    setErrorKey(null);
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorKey("upload.noFileError");
      return;
    }

    setIsLoading(true);
    setErrorKey(null);

    try {
      const prediction = await predictImage(selectedFile);
      
      // Pass prediction result back to parent with filename
      onPredictionComplete({
        ...prediction,
        fileName: selectedFile.name,
      });

      // Reset modal
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      if (typeof err.message === "string" && err.message.startsWith("apiErrors.")) {
        setErrorKey(err.message);
      } else {
        setErrorKey("upload.analyzeError");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    // Reset value so selecting the same file triggers onChange reliably.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleClose} aria-label={t("upload.modalAria")}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("upload.modalTitle")}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label={t("upload.modalCloseAria")}
          >
            {t("upload.closeIcon")}
          </button>
        </div>

        <div className="modal-body">
          {previewUrl ? (
            <div className="preview-section">
              <img
                src={previewUrl}
                alt={t("upload.uploadTitle")}
                className="preview-image"
              />
              <p className="preview-filename">{t("upload.selectedFile", { fileName: selectedFile.name })}</p>
              <button
                type="button"
                className="change-photo-btn"
                onClick={handleUploadClick}
              >
                {t("upload.chooseDifferent")}
              </button>
            </div>
          ) : (
            <div className="upload-area" onClick={handleUploadClick}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                aria-label={t("upload.uploadFileAria")}
              />
              <div className="upload-icon">📸</div>
              <p className="upload-title">{t("upload.uploadTitle")}</p>
              <p className="upload-subtitle">
                {t("upload.uploadSubtitle")}
              </p>
              <button
                type="button"
                className="upload-trigger-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                {t("upload.choosePhoto")}
              </button>
            </div>
          )}

          {errorKey && <div className="error-message">{t(errorKey)}</div>}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t("upload.cancel")}
          </button>
          <button
            type="button"
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? t("upload.analyzing") : t("upload.analyze")}
          </button>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>{t("upload.processing")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPhotoModal;
