import { useRef, useState } from "react";
import { predictImage } from "../api/prediction";

/**
 * UploadPhotoModal Component
 * Handles image selection, preview, and prediction request
 */
function UploadPhotoModal({ isOpen, onClose, onPredictionComplete }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, etc.)");
      return;
    }

    setError(null);
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
      setError("Please select an image first");
      return;
    }

    setIsLoading(true);
    setError(null);

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
      setError(err.message || "Failed to analyze image. Please try again.");
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
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleClose} aria-label="Upload photo modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Crop Photo</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {previewUrl ? (
            <div className="preview-section">
              <img
                src={previewUrl}
                alt="Preview"
                className="preview-image"
              />
              <p className="preview-filename">Selected: {selectedFile.name}</p>
              <button
                type="button"
                className="change-photo-btn"
                onClick={handleUploadClick}
              >
                Choose Different Photo
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
                aria-label="Upload image file"
              />
              <div className="upload-icon">📸</div>
              <p className="upload-title">Select a Photo</p>
              <p className="upload-subtitle">
                Tap to choose an image from gallery or files
              </p>
              <button
                type="button"
                className="upload-trigger-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                Choose Photo
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Processing your image...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPhotoModal;
