import React, { useState, useEffect } from "react";
import { TRANSLATIONS } from "../config/translations.js";
import VoiceSearchButton from "./VoiceSearchButton.jsx";

export default function SearchAndFilters({
  language,
  query,
  onQueryChange,
  searchScope,
  onSearchScopeChange,
  selectedWard,
  onWardChange,
  selectedGender,
  onGenderChange,
  selectedRelationship,
  onRelationshipChange,
  wards = [],
  genders = [],
  relationshipTypes = [],
  voterIdEnabled = false,
  onClearAll
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;
  const [voiceStatus, setVoiceStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    searchScope !== "ALL" ||
    selectedWard !== "ALL" ||
    selectedGender !== "ALL" ||
    selectedRelationship !== "ALL";

  const handleClear = () => {
    setVoiceStatus(null);
    setSearchTerm("");
    onClearAll();
  };

  const handleSearch = () => {
    onQueryChange(searchTerm);
  };

  return (
    <section className="search-section" aria-labelledby="search-heading">
      <div className="search-card">
        <h2 id="search-heading" className="search-section-title">
          {t.searchSectionTitle}
        </h2>

        <div className="search-input-group">
          <label htmlFor="voter-search-input" className="field-label">
            {t.searchInputLabel}
          </label>
          <div className="search-input-row">
            <div className="search-input-wrapper">
              <input
                id="voter-search-input"
                type="search"
                className="search-text-input"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (value === "") {
                    onQueryChange("");
                  }
                }}
                placeholder={t.searchInputPlaceholder}
                autoComplete="off"
              />
            </div>
            <VoiceSearchButton
              language={language}
              onSpeechResult={(spokenText) => {
                setSearchTerm(spokenText);
                onQueryChange(spokenText);
              }}
              onVoiceStatusChange={setVoiceStatus}
            />
            
            <button className="voice-search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>
          <p className="search-helper-text">{t.searchHelperText}</p>
          <p className="voice-helper-note">{t.voiceNote}</p>

          {voiceStatus && (
            <div
              className={`voice-status-banner ${
                voiceStatus.type === "listening" ? "listening" : "error"
              }`}
              role="status"
              aria-live="polite"
            >
              {voiceStatus.message}
            </div>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-item">
            <label htmlFor="ward-filter-select" className="field-label">
              {t.wardFilterLabel}
            </label>
            <select
              id="ward-filter-select"
              className="filter-select"
              value={selectedWard}
              onChange={(e) => onWardChange(e.target.value)}
            >
              <option value="ALL">{t.allWardsOption}</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {t.wardPrefix} {ward}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="scope-filter-select" className="field-label">
              {t.searchFieldLabel}
            </label>
            <select
              id="scope-filter-select"
              className="filter-select"
              value={searchScope}
              onChange={(e) => onSearchScopeChange(e.target.value)}
            >
              <option value="ALL">{t.searchFieldAll}</option>
              <option value="VOTER_NAME">{t.searchFieldVoterName}</option>
              <option value="RELATIVE_NAME">{t.searchFieldRelativeName}</option>
              <option value="SERIAL">{t.searchFieldSerial}</option>
              {voterIdEnabled && (
                <option value="VOTER_ID">{t.searchFieldVoterId}</option>
              )}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="gender-filter-select" className="field-label">
              {t.genderFilterLabel}
            </label>
            <select
              id="gender-filter-select"
              className="filter-select"
              value={selectedGender}
              onChange={(e) => onGenderChange(e.target.value)}
            >
              <option value="ALL">{t.allGendersOption}</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="relationship-filter-select" className="field-label">
              {t.relationshipFilterLabel}
            </label>
            <select
              id="relationship-filter-select"
              className="filter-select"
              value={selectedRelationship}
              onChange={(e) => onRelationshipChange(e.target.value)}
            >
              <option value="ALL">{t.allRelationshipsOption}</option>
              {relationshipTypes.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-actions-row">
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            {t.clearFiltersBtn}
          </button>
        </div>
      </div>
    </section>
  );
}
