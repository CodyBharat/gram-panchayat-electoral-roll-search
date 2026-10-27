import React from "react";
import { WEBSITE_HEADER } from "../config/siteConfig.js";
import { TRANSLATIONS } from "../config/translations.js";

export default function Header({ language, onLanguageChange }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;

  const titleText =
    typeof WEBSITE_HEADER.title === "object"
      ? WEBSITE_HEADER.title[language] || WEBSITE_HEADER.title.hi
      : String(WEBSITE_HEADER.title || "");

  const subtitleText =
    typeof WEBSITE_HEADER.subtitle === "object"
      ? WEBSITE_HEADER.subtitle[language] || WEBSITE_HEADER.subtitle.hi
      : String(WEBSITE_HEADER.subtitle || "");

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <div className="header-brand">
          <img
            src="https://res.cloudinary.com/dbcvuuudd/image/upload/fl_preserve_transparency/v1793018955/logo_tyjcib.jpg?_s=public-apps"
            alt="Logo"
            className="header-logo"
          />
          <div className="header-titles">
            <h1 className="site-title">{titleText}</h1>
            {subtitleText && <p className="site-subtitle">{subtitleText}</p>}
          </div>
        </div>

        <nav className="lang-switch-nav" aria-label={t.langSwitchLabel}>
          <span className="lang-switch-label">{t.langSwitchLabel}</span>
          <div className="lang-btn-group" role="group" aria-label="Language toggle">
            <button
              type="button"
              className={`lang-btn ${language === "hi" ? "active" : ""}`}
              onClick={() => onLanguageChange("hi")}
              aria-pressed={language === "hi"}
            >
              {t.hindiBtn}
            </button>
            <button
              type="button"
              className={`lang-btn ${language === "en" ? "active" : ""}`}
              onClick={() => onLanguageChange("en")}
              aria-pressed={language === "en"}
            >
              {t.englishBtn}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
