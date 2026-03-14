import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickSupportedMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return "";
  }

  return MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getExtensionFromMimeType(mimeType) {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  if (mimeType.includes("webm")) {
    return "webm";
  }

  return "audio";
}

function getVoiceErrorKey(error) {
  if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "voice.secureContextError";
  }

  switch (error?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "voice.permissionDenied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "voice.noMicrophoneFound";
    case "NotReadableError":
    case "TrackStartError":
      return "voice.microphoneBusy";
    default:
      return "voice.recordingFailed";
  }
}

function VoiceInputButton({
  onAudioCaptured,
  resetSignal = 0,
  compact = false,
  className = "",
}) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [errorKey, setErrorKey] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const objectUrlRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const clearPreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const resetComponent = () => {
    stopTimer();
    setIsRecording(false);
    setErrorKey(null);
    setRecordingDuration(0);
    setRecordedAudio(null);
    chunksRef.current = [];
    startedAtRef.current = null;
    mediaRecorderRef.current = null;
    stopTracks();
    clearPreview();
  };

  useEffect(() => {
    resetComponent();

    return () => {
      stopTimer();

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      stopTracks();
      clearPreview();
    };
  }, [resetSignal]);

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErrorKey("voice.unsupportedBrowser");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setErrorKey("voice.secureContextError");
      return;
    }

    stopTimer();
    stopTracks();
    clearPreview();
    setRecordedAudio(null);
    setRecordingDuration(0);
    setErrorKey(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const startedAt = Date.now();

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      startedAtRef.current = startedAt;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        stopTimer();
        stopTracks();
        setIsRecording(false);

        const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : recordingDuration;
        const supportedMimeType = recorder.mimeType || mimeType || "audio/webm";

        if (!chunksRef.current.length) {
          setErrorKey("voice.recordingEmpty");
          setRecordingDuration(0);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: supportedMimeType });
        const objectUrl = URL.createObjectURL(audioBlob);
        const extension = getExtensionFromMimeType(supportedMimeType);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const nextAudio = {
          blob: audioBlob,
          url: objectUrl,
          mimeType: supportedMimeType,
          durationMs,
          fileName: `hindi-voice-note-${timestamp}.${extension}`,
        };

        clearPreview();
        objectUrlRef.current = objectUrl;
        chunksRef.current = [];
        startedAtRef.current = null;
        setRecordingDuration(durationMs);
        setRecordedAudio(nextAudio);
        onAudioCaptured?.(nextAudio);
      });

      recorder.addEventListener("error", () => {
        stopTimer();
        stopTracks();
        setIsRecording(false);
        setErrorKey("voice.recordingFailed");
      });

      recorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setRecordingDuration(Date.now() - startedAtRef.current);
        }
      }, 250);
    } catch (error) {
      stopTimer();
      stopTracks();
      setIsRecording(false);
      setErrorKey(getVoiceErrorKey(error));
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    startRecording();
  };

  const handleDiscard = () => {
    clearPreview();
    setRecordedAudio(null);
    setRecordingDuration(0);
    setErrorKey(null);
  };

  return (
    <section className={`voice-input-card${compact ? " voice-input-card--compact" : ""}${className ? ` ${className}` : ""}`}>
      <div className="voice-input-header">
        <div>
          <p className="voice-input-eyebrow">{t("voice.eyebrow")}</p>
          <h3 className="voice-input-title">{t(compact ? "voice.compactTitle" : "voice.title")}</h3>
        </div>
        {isRecording ? (
          <span className="voice-live-pill">
            <span className="voice-live-dot" aria-hidden="true" />
            {t("voice.listening")}
          </span>
        ) : null}
      </div>

      <p className="voice-input-description">
        {t(compact ? "voice.compactDescription" : "voice.description")}
      </p>

      <button
        type="button"
        className={`voice-record-button${isRecording ? " is-recording" : ""}`}
        onClick={handleToggleRecording}
        aria-pressed={isRecording}
      >
        <span className="voice-record-icon" aria-hidden="true" />
        <span className="voice-record-copy">
          <strong>{t(isRecording ? "voice.stopRecording" : "voice.startRecording")}</strong>
          <span>{isRecording ? t("voice.recordingNow") : t("voice.readyHint")}</span>
        </span>
        <span className="voice-record-timer">{formatDuration(recordingDuration)}</span>
      </button>

      {errorKey ? <div className="error-message">{t(errorKey)}</div> : null}

      {recordedAudio ? (
        <div className="voice-preview-card">
          <div className="voice-preview-head">
            <div>
              <p className="voice-preview-label">{t("voice.savedLabel")}</p>
              <p className="voice-preview-meta">{t("voice.duration", { duration: formatDuration(recordedAudio.durationMs) })}</p>
            </div>
            <button type="button" className="voice-discard-btn" onClick={handleDiscard}>
              {t("voice.discard")}
            </button>
          </div>
          <audio controls className="voice-audio-player" src={recordedAudio.url}>
            {t("voice.audioFallback")}
          </audio>
        </div>
      ) : null}
    </section>
  );
}

export default VoiceInputButton;