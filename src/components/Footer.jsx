import React from "react";
import { FOOTER_SLOGAN } from "../config/siteConfig.js";

/**
 * Footer Component
 * - Displays the code-configurable `FOOTER_SLOGAN` from `src/config/siteConfig.js`.
 * - Not editable through the public website interface.
 */
export default function Footer({ language }) {
  const sloganText =
    typeof FOOTER_SLOGAN === "object"
      ? FOOTER_SLOGAN[language] || FOOTER_SLOGAN.hi || FOOTER_SLOGAN.en
      : String(FOOTER_SLOGAN || "");

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        {sloganText && <p className="footer-slogan">{sloganText}</p>}
      </div>
    </footer>
  );
}
