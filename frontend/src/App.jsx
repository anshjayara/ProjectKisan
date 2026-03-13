import { useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setResult(null);
    setError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Prediction request failed.");
      }

      const data = await response.json();
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">AgroAid Prototype</p>
        <h1>AI Crop Leaf Disease Detection</h1>
        <p className="subtitle">
          Upload a crop leaf image to detect likely diseases and get treatment guidance.
        </p>
      </header>

      <main className="grid">
        <section className="card uploader">
          <h2>Leaf Image Upload</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="leaf-image" className="upload-label">
              Select crop leaf image
            </label>
            <input
              id="leaf-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Detect Disease"}
            </button>
          </form>

          {previewUrl ? (
            <div className="preview-wrap">
              <p>Preview</p>
              <img src={previewUrl} alt="Selected crop leaf" className="preview" />
            </div>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="card result-panel">
          <h2>Detection Result</h2>
          {!result ? (
            <p className="muted">Run a prediction to see disease name and treatment suggestions.</p>
          ) : (
            <div className="result-content">
              <div className="result-row">
                <span>Disease</span>
                <strong>{result.disease}</strong>
              </div>
              <div className="result-row">
                <span>Confidence</span>
                <strong>{Math.round(result.confidence * 100)}%</strong>
              </div>
              <div className="treatment">
                <h3>Suggested Treatment</h3>
                <p>{result.treatment}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer-note">
        <p>Next modules planned: weather-based disease risk and crop damage assessment.</p>
      </footer>
    </div>
  );
}

export default App;
