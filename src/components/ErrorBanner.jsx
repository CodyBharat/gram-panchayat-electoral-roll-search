import React from "react";
import { TRANSLATIONS } from "../config/translations.js";

/**
 * Displays actionable error messages and troubleshooting steps if loading the
 * Google Sheet fails (e.g., permission denied, wrong spreadsheet ID, invalid tab name,
 * missing headers, or network errors). Never shows fabricated records on error.
 */
export default function ErrorBanner({ error, language, onRetry }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;

  if (!error) return null;

  const mainMessage =
    language === "hi"
      ? error.messageHi || error.messageEn
      : error.messageEn || error.messageHi;

  const steps = Array.isArray(error.troubleshootingSteps)
    ? error.troubleshootingSteps
    : [];

  return (
    <section className="error-banner-box" role="alert" aria-live="assertive">
      <div className="error-banner-header">
        <h2 className="error-banner-title">{t.errorBannerTitle}</h2>
        {error.code && <span className="error-code-badge">{error.code}</span>}
      </div>

      <p className="error-banner-message">{mainMessage}</p>

      {steps.length > 0 && (
        <div className="error-troubleshooting">
          <h3 className="troubleshooting-heading">{t.troubleshootingTitle}</h3>
          <ul className="troubleshooting-list">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="error-actions">
        <button type="button" className="retry-btn" onClick={onRetry}>
          {t.retryBtn}
        </button>
      </div>
    </section>
  );
}
