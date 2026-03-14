import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  buildDiagnosisSpeechText,
  speakDiagnosisRecommendation,
  stopSpeech,
} from "../utils/diagnosisSpeech";

function DiagnosisVoiceAssistant({ diagnosisResult, language }) {
  const { t } = useLanguage();
  const [voices, setVoices] = useState([]);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const speechText = useMemo(
    () => buildDiagnosisSpeechText(diagnosisResult, language),
    [diagnosisResult, language],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeechSupported(false);
      setIsLoadingVoices(false);
      return undefined;
    }

    setIsSpeechSupported(true);

    const loadVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);
      setIsLoadingVoices(false);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      stopSpeech();
      utteranceRef.current = null;
      setIsSpeaking(false);
    };
  }, []);

  useEffect(() => {
    stopSpeech();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, [speechText]);

  const handlePlay = () => {
    if (!speechText || !isSpeechSupported) {
      return;
    }

    setIsSpeaking(true);
    const utterance = speakDiagnosisRecommendation(speechText, language, voices);

    if (!utterance) {
      setIsSpeaking(false);
      return;
    }

    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsSpeaking(false);
      }
    };

    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsSpeaking(false);
      }
    };

    utteranceRef.current = utterance;
  };

  const handleStop = () => {
    stopSpeech();
    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  if (!diagnosisResult) {
    return null;
  }

  return (
    <section className="diagnosis-voice-card" aria-label={t("prediction.voice.ariaLabel")}>
      <div className="diagnosis-voice-header">
        <div>
          <p className="diagnosis-voice-eyebrow">{t("prediction.voice.eyebrow")}</p>
          <h3 className="diagnosis-voice-title">{t("prediction.voice.title")}</h3>
        </div>
        {isSpeaking ? <span className="diagnosis-voice-badge">{t("prediction.voice.speaking")}</span> : null}
      </div>

      <p className="diagnosis-voice-copy">{t("prediction.voice.description")}</p>

      {!isSpeechSupported ? (
        <p className="diagnosis-voice-note">{t("prediction.voice.unsupported")}</p>
      ) : (
        <>
          <div className="diagnosis-voice-actions">
            <button
              type="button"
              className={`diagnosis-voice-button diagnosis-voice-button--play${isSpeaking ? " is-active" : ""}`}
              onClick={handlePlay}
              disabled={!speechText || isLoadingVoices}
            >
              <span className="diagnosis-voice-button-icon" aria-hidden="true">▶</span>
              <span>
                {language === "hi"
                  ? t("prediction.voice.listenHindi")
                  : t("prediction.voice.listenEnglish")}
              </span>
            </button>

            <button
              type="button"
              className="diagnosis-voice-button diagnosis-voice-button--stop"
              onClick={handleStop}
              disabled={!isSpeaking}
            >
              <span className="diagnosis-voice-button-icon" aria-hidden="true">■</span>
              <span>{t("prediction.voice.stop")}</span>
            </button>
          </div>

          <p className="diagnosis-voice-note">
            {isLoadingVoices
              ? t("prediction.voice.loading")
              : t("prediction.voice.fallback")}
          </p>
        </>
      )}
    </section>
  );
}

export default DiagnosisVoiceAssistant;