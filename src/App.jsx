import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header.jsx";
import CandidateBanner from "./components/CandidateBanner.jsx";
import SearchAndFilters from "./components/SearchAndFilters.jsx";
import VoterCard from "./components/VoterCard.jsx";
import ErrorBanner from "./components/ErrorBanner.jsx";
import Footer from "./components/Footer.jsx";
import { fetchElectoralRoll, clearClientCache } from "./services/voterDataService.js";
import { filterVoterRecords } from "./utils/searchUtils.js";
<<<<<<< HEAD
import ScrollToTopBottom from "./components/ScrollToTopBottom.jsx";
=======
>>>>>>> 00be11f (Update siteConfig)
import {
  DEFAULT_LANGUAGE,
  RESULTS_PER_PAGE,
  BACKGROUND_IMAGE_URL
} from "./config/siteConfig.js";
import { TRANSLATIONS } from "./config/translations.js";

export default function App() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE || "hi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [rollData, setRollData] = useState({
    sourceMode: "SAMPLE",
    isSampleData: false,
    voterIdEnabled: true,
    records: [],
    wards: [],
    genders: [],
    relationshipTypes: []
  });

<<<<<<< HEAD
=======
  // Splash screen timer
>>>>>>> 00be11f (Update siteConfig)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

<<<<<<< HEAD
=======
  // Search and filter states
>>>>>>> 00be11f (Update siteConfig)
  const [query, setQuery] = useState("");
  const [searchScope, setSearchScope] = useState("ALL");
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [selectedRelationship, setSelectedRelationship] = useState("ALL");
<<<<<<< HEAD
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
=======

  // Pagination state (Load More)
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);

  // Background image validation state
>>>>>>> 00be11f (Update siteConfig)
  const [bgValid, setBgValid] = useState(false);

  useEffect(() => {
    const trimmedBg = String(BACKGROUND_IMAGE_URL || "").trim();
    if (!trimmedBg) {
      setBgValid(false);
      return;
    }
    const img = new Image();
    img.onload = () => setBgValid(true);
    img.onerror = () => setBgValid(false);
    img.src = trimmedBg;
  }, []);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) {
        clearClientCache();
      }
      const data = await fetchElectoralRoll(forceRefresh);
      setRollData(data);
    } catch (err) {
      setError(
        err.structuredError || {
          code: "LOAD_ERROR",
          messageEn: err.message || "Unable to load electoral roll data.",
          messageHi: "मतदाता सूची डेटा लोड करने में असमर्थ।",
          troubleshootingSteps: []
        }
      );
      setRollData((prev) => ({ ...prev, records: [] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  useEffect(() => {
    setVisibleCount(RESULTS_PER_PAGE);
  }, [query, searchScope, selectedWard, selectedGender, selectedRelationship]);

  const filteredRecords = useMemo(() => {
    return filterVoterRecords(rollData.records, {
      query,
      searchScope,
      ward: selectedWard,
      gender: selectedGender,
      relationshipType: selectedRelationship,
      voterIdEnabled: rollData.voterIdEnabled
    });
<<<<<<< HEAD
    /* console.log(filteredRecords);*/
=======
>>>>>>> 00be11f (Update siteConfig)
  }, [
    rollData.records,
    rollData.voterIdEnabled,
    query,
    searchScope,
    selectedWard,
    selectedGender,
    selectedRelationship
  ]);

  const visibleRecords = useMemo(() => {
    return filteredRecords.slice(0, visibleCount);
  }, [filteredRecords, visibleCount]);

  const handleClearAllFilters = () => {
    setQuery("");
    setSearchScope("ALL");
    setSelectedWard("ALL");
    setSelectedGender("ALL");
    setSelectedRelationship("ALL");
    setVisibleCount(RESULTS_PER_PAGE);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;

  const appWrapperStyle = bgValid
    ? {
        "--custom-bg-image": `url("${String(BACKGROUND_IMAGE_URL).trim()}")`
      }
    : {};

  return showSplash ? (
    <div className="splash-screen">
      <img src={BACKGROUND_IMAGE_URL} alt="Splash Background" />
    </div>
  ) : (
    <div
      className={`app-shell ${bgValid ? "has-custom-bg" : ""}`}
      style={appWrapperStyle}
      lang={language}
    >
      <div className="app-backdrop-overlay">
<<<<<<< HEAD
        <Header language={language} onLanguageChange={setLanguage} />
        <CandidateBanner language={language} />

        <main className="main-content container">
=======
        {/* 1. Website Header with Language Switch */}
        <Header language={language} onLanguageChange={setLanguage} />

        {/* 2. Static Candidate Publicity Banner (Below Header, Above Search) */}
        <CandidateBanner language={language} />

        <main className="main-content container">
          {/* Sample Data Mode Notice Banner */}
>>>>>>> 00be11f (Update siteConfig)
          {!loading && !error && rollData.isSampleData && (
            <div className="sample-mode-banner" role="status">
              <div className="sample-mode-badge">{t.sampleModeBadge}</div>
              <p className="sample-mode-text">{t.sampleModeNote}</p>
            </div>
          )}

<<<<<<< HEAD
=======
          {/* 3. Search Box, Voice Search Button, and Filter Controls */}
>>>>>>> 00be11f (Update siteConfig)
          <SearchAndFilters
            language={language}
            query={query}
            onQueryChange={setQuery}
            searchScope={searchScope}
            onSearchScopeChange={setSearchScope}
            selectedWard={selectedWard}
            onWardChange={setSelectedWard}
            selectedGender={selectedGender}
            onGenderChange={setSelectedGender}
            selectedRelationship={selectedRelationship}
            onRelationshipChange={setSelectedRelationship}
            wards={rollData.wards}
            genders={rollData.genders}
            relationshipTypes={rollData.relationshipTypes}
            voterIdEnabled={rollData.voterIdEnabled}
            onClearAll={handleClearAllFilters}
          />

<<<<<<< HEAD
=======
          {/* 4. Loading State */}
>>>>>>> 00be11f (Update siteConfig)
          {loading && (
            <div className="status-card loading-state" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true" />
              <p className="loading-text">{t.loadingMessage}</p>
            </div>
          )}

<<<<<<< HEAD
=======
          {/* 5. Error State */}
>>>>>>> 00be11f (Update siteConfig)
          {!loading && error && (
            <ErrorBanner
              error={error}
              language={language}
              onRetry={() => loadData(true)}
            />
          )}

<<<<<<< HEAD
=======
          {/* 6. Results Summary & Individual Vertical Voter Cards */}
>>>>>>> 00be11f (Update siteConfig)
          {!loading && !error && (
            <section className="results-section" aria-live="polite">
              <div className="results-summary-bar">
                <div className="results-total-count">
                  <span>{t.totalMatchingLabel}</span>{" "}
                  <strong className="count-badge">{filteredRecords.length}</strong>
                </div>
                {filteredRecords.length > 0 && (
                  <div className="results-showing-range">
<<<<<<< HEAD
                    {t.showingCountLabel} <strong>{visibleRecords.length}</strong>
                    {""}
=======
                    {t.showingCountLabel} <strong>{visibleRecords.length}</strong>{" "}
>>>>>>> 00be11f (Update siteConfig)
                    {t.ofLabel} <strong>{filteredRecords.length}</strong>
                  </div>
                )}
              </div>

              {filteredRecords.length === 0 ? (
                <div className="status-card no-results-state">
                  <h3 className="no-results-title">{t.noResultsTitle}</h3>
                  <p className="no-results-subtitle">{t.noResultsSubtitle}</p>
                  <button
                    type="button"
                    className="clear-filters-btn secondary"
                    onClick={handleClearAllFilters}
                  >
                    {t.clearFiltersBtn}
                  </button>
                </div>
              ) : (
                <>
                  <div className="voter-cards-grid">
<<<<<<< HEAD
                
=======
>>>>>>> 00be11f (Update siteConfig)
                    {visibleRecords.map((record) => (
                      <VoterCard
                        key={record.id}
                        record={record}
                        language={language}
                        voterIdEnabled={rollData.voterIdEnabled}
                      />
                    ))}
                  </div>

                  {visibleCount < filteredRecords.length && (
                    <div className="pagination-container">
                      <button
                        type="button"
                        className="load-more-btn"
                        onClick={() =>
                          setVisibleCount((prev) => prev + RESULTS_PER_PAGE)
                        }
                      >
                        {t.loadMoreBtn} ({filteredRecords.length - visibleCount})
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>

<<<<<<< HEAD
        
        <Footer language={language} />
      </div>
      <ScrollToTopBottom />
=======
        {/* 7. Footer */}
        <Footer language={language} />
      </div>
>>>>>>> 00be11f (Update siteConfig)
    </div>
  );
}
