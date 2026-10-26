/**
 * ============================================================================
 * WEBSITE CONFIGURATION (CODE-ONLY SETTINGS)
 * ============================================================================
 * Edit the settings below in Visual Studio Code (VS Code) to customize:
 * 1. Website Title & Subtitle (in both Hindi and English)
 * 2. Candidate Publicity Banner Image (`CANDIDATE_BANNER_URL`)
 * 3. Optional Website Background Image (`BACKGROUND_IMAGE_URL`)
 * 4. Footer Slogan (`FOOTER_SLOGAN`)
 * 5. Pagination Page Size (`RESULTS_PER_PAGE`)
 *
 * SECURITY NOTE:
 * None of these settings are editable from the public website interface.
 * Never place private Google Cloud keys or credentials in this file!
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CANDIDATE PUBLICITY BANNER CONFIGURATION
// ----------------------------------------------------------------------------
// How to configure:
// - Option A (Local image in project): Place your image file inside the
//   `public/assets/` folder (for example, `public/assets/banner.jpg`) and set:
//   export const CANDIDATE_BANNER_URL = "/assets/banner.jpg";
// - Option B (Direct image URL): Set a full https:// URL to your hosted image.
// - Leave as "" (empty string) to cleanly hide the banner section.
// Note: If the image fails to load or is empty, the banner hides automatically.
export const CANDIDATE_BANNER_URL = "https://res.cloudinary.com/dbcvuuudd/image/upload/fl_preserve_transparency/v1793020297/banner_dpq54h.jpg?_s=public-apps";

// Optional alt text for screen readers when a banner is configured:
export const CANDIDATE_BANNER_ALT = {
  hi: "ग्राम पंचायत सूचना बैनर",
  en: "Gram Panchayat Information Banner"
};

// ----------------------------------------------------------------------------
// 2. OPTIONAL BACKGROUND IMAGE CONFIGURATION
// ----------------------------------------------------------------------------
// How to configure:
// - Place an image in `public/assets/bg.jpg` and set `"/assets/bg.jpg"`, or
//   provide a valid image URL.
// - Leave as "" (empty string) to use the default clean solid background.
// - When configured, a high-contrast protective overlay is automatically applied
//   so search inputs and voter cards remain 100% readable.
export const BACKGROUND_IMAGE_URL = "https://res.cloudinary.com/dbcvuuudd/image/upload/fl_preserve_transparency/v1793016324/980efa02-4bae-4cde-90e0-e86d8eb54e28_eht9ad.jpg?_s=public-apps";


// ----------------------------------------------------------------------------
// 3. WEBSITE HEADER TITLE & SUBTITLE
// ----------------------------------------------------------------------------
export const WEBSITE_HEADER = {
  title: {
    hi: "उदासर ग्राम पंचायत मतदाता सूची",
    en: "Udasar Gram Panchayat Electoral Roll"
  },
  subtitle: {
    hi: "टीम हेम सिंह पड़िहार: सेवा ही धर्म, विकास ही कर्म।",
    en: "टीम हेम सिंह पड़िहार: सेवा ही धर्म, विकास ही कर्म।"
  }
};

// ----------------------------------------------------------------------------
// 4. FOOTER SLOGAN
// ----------------------------------------------------------------------------
// Edit `FOOTER_SLOGAN` below to display your custom message in the footer.
// You can set a single string or an object with `{ hi, en }` translations.
export const FOOTER_SLOGAN = {
  hi: "यह वेबसाइट भरत उपाध्याय द्वारा बनाई गई और प्रबंधित की जाती है।",
  en: "The website is created and managed by Bharat Upadhyay."
};

// ----------------------------------------------------------------------------
// 5. Updated SEARCH & PAGINATION SETTINGS
// ----------------------------------------------------------------------------
// Number of vertical voter cards displayed initially before clicking "Load More"
export const RESULTS_PER_PAGE = 10;

// Default interface language ("hi" for Hindi, "en" for English)
export const DEFAULT_LANGUAGE = "hi";
