import React, { useState, useRef, useEffect } from "react";
import { TRANSLATIONS } from "../config/translations.js";

/**
 * VoiceSearchButton Component
 * - Uses browser SpeechRecognition / webkitSpeechRecognition API when supported.
 * - Respects the currently selected interface language ("hi-IN" for Hindi, "en-IN" for English).
 * - Inserts recognized words directly into the search input so users can edit before or after searching.
 * - Handles unsupported browsers, permission denial, empty speech, and recognition errors cleanly.
 */
export default function VoiceSearchButton({ language, onSpeechResult, onVoiceStatusChange }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const handleToggleVoice = () => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      onVoiceStatusChange({
        type: "error",
        message: t.voiceUnsupported
      });
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {
        // ignore stop error
      }
      setIsListening(false);
      onVoiceStatusChange(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Respect selected language (Hindi -> hi-IN, English -> en-IN)
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        onVoiceStatusChange({
          type: "listening",
          message: t.voiceListening
        });
      };

      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        const cleaned = transcript.trim().replace(/[।.?!,]+$/, "");
        if (cleaned) {
          onSpeechResult(cleaned);
          onVoiceStatusChange(null);
        } else {
          onVoiceStatusChange({
            type: "error",
            message: t.voiceNoSpeech
          });
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        const errCode = event?.error || "";
        if (errCode === "not-allowed" || errCode === "service-not-allowed") {
          onVoiceStatusChange({
            type: "error",
            message: t.voicePermissionDenied
          });
        } else if (errCode === "no-speech") {
          onVoiceStatusChange({
            type: "error",
            message: t.voiceNoSpeech
          });
        } else {
          onVoiceStatusChange({
            type: "error",
            message: t.voiceGenericError
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      onVoiceStatusChange({
        type: "error",
        message: t.voiceGenericError
      });
    }
  };

  return (
    <button
      type="button"
      className={`voice-search-btn ${isListening ? "listening" : ""}`}
      onClick={handleToggleVoice}
      title={t.voiceSearchBtnTitle}
      aria-label={t.voiceSearchBtnTitle}
      aria-pressed={isListening}
    >
      {/* Microphone SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
        <line x1="8" x2="16" y1="22" y2="22" />
      </svg>
      {isListening && <span className="pulse-dot" aria-hidden="true" />}
    </button>
  );
}
