/**
 * ============================================================================
 * SEARCH, FILTERING & UNICODE NORMALIZATION LOGIC
 * ============================================================================
 * Implements:
 * - English text normalization (case-insensitive, trims and collapses spaces)
 * - Hindi Devanagari Unicode normalization (NFC normalization, चंद्रबिंदु / अनुस्वार
 *   equivalence, नुक्ता normalization, and whitespace collapsing) FOR MATCHING ONLY
 *   without ever altering the original displayed voter names.
 * - Search by Hindi name, English name, Relative's Hindi name, Relative's English
 *   name, Serial Number, and (when enabled) Voter ID / EPIC Number.
 * - Combined filtering with Ward Number, Gender, and Relationship Type.
 * - Multi-word partial matching so "राजेश शर्मा" matches "राजेश कुमार शर्मा".
 * ============================================================================
 */

/**
 * Normalizes English or numeric strings for comparison:
 * - Converts to NFC Unicode form
 * - Lowercases
 * - Collapses multiple spaces into a single space
 */
export function normalizeEnglishText(text = "") {
  if (!text) return "";
  return String(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes Hindi Devanagari strings for search matching ONLY:
 * - Converts to Unicode NFC canonical form
 * - Normalizes Chandrabindu (ँ ँ) to Anusvara (ं ं) so common spelling
 *   variations match seamlessly
 * - Removes Nukta (़ ़) so क़/क, ज़/ज, ड़/ड match regardless of keyboard input
 * - Normalizes अर्ध-अनुस्वार / हलंत combinations commonly typed differently
 * - Collapses extra spaces
 * Note: Displayed names on cards are NEVER modified by this function.
 */
export function normalizeHindiText(text = "") {
  if (!text) return "";
  return String(text)
    .normalize("NFC")
    .replace(/\u0901/g, "\u0902") // Chandrabindu -> Anusvara
    .replace(/\u093C/g, "")       // Strip Devanagari Nukta for flexible matching
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether all space-separated tokens in the user's query appear in the
 * target field (supporting partial-name and multi-token searches).
 */
export function matchesQueryTokens(targetValue = "", query = "", isHindi = false) {
  if (!query) return true;
  if (!targetValue) return false;

  const normTarget = isHindi ? normalizeHindiText(targetValue) : normalizeEnglishText(targetValue);
  const normQuery = isHindi ? normalizeHindiText(query) : normalizeEnglishText(query);

  if (!normQuery) return true;

  // Direct substring match
  if (normTarget.includes(normQuery)) {
    return true;
  }

  // Token-based partial match (e.g., query "Rajesh Sharma" matches "Rajesh Kumar Sharma")
  const queryTokens = normQuery.split(" ").filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => normTarget.includes(token));
  }

  return false;
}

/**
 * Checks if a serial number or house number matches the query.
 * Supports exact match or prefix/substring match while ignoring leading zeros.
 */
export function matchesSerialOrId(fieldValue = "", query = "") {
  if (!query) return true;
  if (!fieldValue) return false;

  const normField = normalizeEnglishText(fieldValue);
  const normQuery = normalizeEnglishText(query);

  if (normField === normQuery || normField.includes(normQuery)) {
    return true;
  }

  // Also compare without leading zeros if both are numeric
  const strippedField = normField.replace(/^0+/, "");
  const strippedQuery = normQuery.replace(/^0+/, "");
  if (strippedField && strippedQuery && strippedField === strippedQuery) {
    return true;
  }

  return false;
}

/**
 * Filters the array of voter records based on the active search query and
 * dropdown filter selections.
 *
 * @param {Array} records - Array of voter record objects from the configured data source
 * @param {Object} filters - { query, searchScope, ward, gender, relationshipType, voterIdEnabled }
 * @returns {Array} Matching voter records
 */
export function filterVoterRecords(records = [], filters = {}) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const {
    query = "",
    searchScope = "ALL", // ALL | VOTER_NAME | RELATIVE_NAME | SERIAL | VOTER_ID
    ward = "ALL",
    gender = "ALL",
    relationshipType = "ALL",
    voterIdEnabled = false
  } = filters;

  const trimmedQuery = String(query || "").trim();

  return records.filter((record) => {
    if (!record) return false;

    // 1. Ward filter
    if (ward && ward !== "ALL") {
      if (String(record.wardNumber || "").trim() !== String(ward).trim()) {
        return false;
      }
    }

    // 2. Optional Gender filter
    if (gender && gender !== "ALL") {
      if (String(record.gender || "").trim() !== String(gender).trim()) {
        return false;
      }
    }

    // 3. Optional Relationship Type filter
    if (relationshipType && relationshipType !== "ALL") {
      if (String(record.relationshipType || "").trim() !== String(relationshipType).trim()) {
        return false;
      }
    }

    // 4. If no search query is entered, return all records matching the dropdown filters
    if (!trimmedQuery) {
      return true;
    }

    // 5. Evaluate search query against selected scope
    const matchNameHi = matchesQueryTokens(record.nameHindi, trimmedQuery, true);
    const matchNameEn = matchesQueryTokens(record.nameEnglish, trimmedQuery, false);
    const matchRelHi = matchesQueryTokens(record.relativeNameHindi, trimmedQuery, true);
    const matchRelEn = matchesQueryTokens(record.relativeNameEnglish, trimmedQuery, false);
    const matchSerial = matchesSerialOrId(record.serialNumber, trimmedQuery);
    const matchVoterId =
      voterIdEnabled && record.voterId
        ? matchesSerialOrId(record.voterId, trimmedQuery)
        : false;

    switch (searchScope) {
      case "VOTER_NAME":
        return matchNameHi || matchNameEn;
      case "RELATIVE_NAME":
        return matchRelHi || matchRelEn;
      case "SERIAL":
        return matchSerial;
      case "VOTER_ID":
        return matchVoterId;
      case "ALL":
      default:
        return (
          matchNameHi ||
          matchNameEn ||
          matchRelHi ||
          matchRelEn ||
          matchSerial ||
          matchVoterId
        );
    }
  });
}
