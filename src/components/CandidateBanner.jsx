import React, { useState, useEffect } from "react";
import { CANDIDATE_BANNER_URL, CANDIDATE_BANNER_ALT } from "../config/siteConfig.js";

/**
 * Static Candidate Publicity Banner Component
 * - Displays a single static image configured via `CANDIDATE_BANNER_URL` in
 *   `src/config/siteConfig.js`.
 * - Maintains aspect ratio and uses `object-fit: contain` so faces, names,
 *   and text are never cropped on mobile or desktop.
 * - Automatically hides cleanly if `CANDIDATE_BANNER_URL` is empty or fails to load.
 */
export default function CandidateBanner({ language }) {
  const [imageError, setImageError] = useState(false);

  const trimmedUrl = String(CANDIDATE_BANNER_URL || "").trim();

  useEffect(() => {
    setImageError(false);
  }, [trimmedUrl]);

  if (!trimmedUrl || imageError) {
    return null;
  }

  const altText =
    typeof CANDIDATE_BANNER_ALT === "object"
      ? CANDIDATE_BANNER_ALT[language] || CANDIDATE_BANNER_ALT.hi
      : String(CANDIDATE_BANNER_ALT || "Candidate Banner");

  return (
    <section className="candidate-banner-section" aria-label={altText}>
      <div className="container">
        <div className="candidate-banner-wrapper">
          <img
            src={trimmedUrl}
            alt={altText}
            className="candidate-banner-image"
            onError={() => setImageError(true)}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
