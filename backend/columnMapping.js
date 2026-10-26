/**
 * ============================================================================
 * COLUMN HEADER MAPPING CONFIGURATION
 * ============================================================================
 * Your Google Sheet might use slightly different column names in Row 1
 * (for example, "Ward No", "वार्ड संख्या", or "Ward Number").
 *
 * You can add or edit acceptable spreadsheet column header names in the arrays
 * below so they map cleanly to the application's internal field names without
 * rewriting any search or display code.
 *
 * Matching is case-insensitive and ignores leading/trailing spaces.
 * ============================================================================
 */

export const COLUMN_MAPPING = {
  wardNumber: {
    required: true,
    label: "Ward Number / वार्ड संख्या",
    acceptedHeaders: [
      "Ward Number",
      "Ward No",
      "Ward No.",
      "Ward",
      "वार्ड क्र.",
      "वार्ड संख्या",
      "वार्ड नं.",
      "वार्ड नं",
      "वार्ड",
    ]
  },
  serialNumber: {
    required: true,
    label: "Serial Number / क्रम संख्या",
    acceptedHeaders: [
      "Serial Number",
      "Serial No",
      "Serial No.",
      "S.No",
      "S.No.",
      "Sr No",
      "Sr. No.",
      "क्रम संख्या",
      "क्रमांक",
      "क्र.सं.",
    ]
  },
  voterId: {
<<<<<<< HEAD
    required: true,
=======
    required: false,
>>>>>>> 00be11f (Update siteConfig)
    label: "Voter ID / ID Number / मतदाता पहचान पत्र संख्या",
    acceptedHeaders: [
      "Voter ID",
      "Voter ID / EPIC Number",
      "EPIC Number",
      "EPIC No",
      "Epic Number",
      "EPIC No.",
      "EPIC",
      "ID Card No",
      "मतदाता पहचान पत्र संख्या",
      "पहचान पत्र संख्या",
      "ईपिक संख्या",
    ]
  },
  nameHindi: {
    required: false, // At least one of nameHindi or nameEnglish is validated
    label: "Name in Hindi / नाम (हिंदी)",
    acceptedHeaders: [
      "Name in Hindi",
      "Name (Hindi)",
      "Hindi Name",
      "Voter Name Hindi",
      "नाम (हिंदी)",
      "मतदाता का नाम (हिंदी)",
      "मतदाता का नाम",
      "नाम",
    ]
  },
  nameEnglish: {
    required: false, // At least one of nameHindi or nameEnglish is validated
    label: "Name in English / नाम (अंग्रेजी)",
    acceptedHeaders: [
      "Name in English",
      "Name (English)",
      "English Name",
      "Voter Name English",
      "Voter Name",
      "Name",
      "नाम (अंग्रेजी)",
    ]
  },
  relationshipType: {
    required: false,
    label: "Relationship Type / संबंध का प्रकार",
    acceptedHeaders: [
      "Relationship Type",
      "Relationship",
      "Relation Type",
      "Relation",
      "संबंध का प्रकार",
      "संबंध",
      "रिश्ता",
    ]
  },
  relativeNameHindi: {
    required: false,
    label: "Relative's Name in Hindi / संबंधी का नाम (हिंदी)",
    acceptedHeaders: [
      "Relative’s Name in Hindi",
      "Relative's Name in Hindi",
      "Relative Name in Hindi",
      "Relative Name (Hindi)",
      "Father/Husband Name Hindi",
      "संबंधी का नाम (हिंदी)",
      "संबंधी का नाम",
      "पिता/पति का नाम (हिंदी)",
      "पिता/पति का नाम",
    ]
  },
  relativeNameEnglish: {
    required: false,
    label: "Relative's Name in English / संबंधी का नाम (अंग्रेजी)",
    acceptedHeaders: [
      "Relative’s Name in English",
      "Relative's Name in English",
      "Relative Name in English",
      "Relative Name (English)",
      "Relative Name",
      "Father/Husband Name English",
      "संबंधी का नाम (अंग्रेजी)",
      "पिता/पति का नाम (अंग्रेजी)",
    ]
  },
  houseNumber: {
    required: false,
    label: "House Number / मकान संख्या",
    acceptedHeaders: [
      "House Number",
      "House No",
      "House No.",
      "H.No",
      "H.No.",
      "मकान संख्या",
      "मकान नं.",
      "मकान नं",
      "गृह संख्या",
    ]
  },
  age: {
    required: false,
    label: "Age / आयु",
    acceptedHeaders: [
      "Age",
      "Voter Age",
      "आयु",
      "उम्र",
    ]
  },
  gender: {
    required: false,
    label: "Gender / लिंग",
    acceptedHeaders: [
      "Gender",
      "Sex",
      "लिंग",
    ]
  }
};

/**
 * Maps raw Row 1 spreadsheet headers to internal field indices.
 * Never shifts columns or guesses positional order.
 */
export function resolveHeaderMap(rawHeaders = []) {
  const normalizedHeaders = rawHeaders.map((h) =>
    String(h || "").trim().toLowerCase().replace(/\s+/g, " ")
  );

  const fieldToIndex = {};
  const missingRequired = [];

  for (const [fieldKey, config] of Object.entries(COLUMN_MAPPING)) {
    let foundIndex = -1;
    for (const candidate of config.acceptedHeaders) {
      const normCandidate = candidate.trim().toLowerCase().replace(/\s+/g, " ");
      const idx = normalizedHeaders.indexOf(normCandidate);
      if (idx !== -1) {
        foundIndex = idx;
        break;
      }
    }

    if (foundIndex !== -1) {
      fieldToIndex[fieldKey] = foundIndex;
    } else if (config.required) {
      missingRequired.push(config.label);
    }
  }

  // Ensure at least one name column exists (Hindi or English)
  if (fieldToIndex.nameHindi === undefined && fieldToIndex.nameEnglish === undefined) {
    missingRequired.push("Name in Hindi OR Name in English (नाम)");
  }

  return {
    fieldToIndex,
    missingRequired,
    isValid: missingRequired.length === 0
  };
}

/**
 * Converts a single spreadsheet row array into a structured voter record object
 * using the resolved header map. Handles missing optional fields cleanly without
 * shifting column values or combining records.
 */
<<<<<<< HEAD
export function mapRowToRecord(row = [], fieldToIndex = {}, rowIndex = 0, allowVoterId = true) {
=======
export function mapRowToRecord(row = [], fieldToIndex = {}, rowIndex = 0, allowVoterId = false) {
>>>>>>> 00be11f (Update siteConfig)
  const getCell = (fieldKey) => {
    const colIdx = fieldToIndex[fieldKey];
    if (colIdx === undefined || colIdx < 0 || colIdx >= row.length) {
      return "";
    }
    const rawVal = row[colIdx];
    return rawVal !== null && rawVal !== undefined ? String(rawVal).trim() : "";
  };

  const wardNumber = getCell("wardNumber");
  const serialNumber = getCell("serialNumber");
  const nameHindi = getCell("nameHindi");
  const nameEnglish = getCell("nameEnglish");

  // Skip completely blank rows
  if (!wardNumber && !serialNumber && !nameHindi && !nameEnglish) {
    return null;
  }

  const record = {
    id: `row-${rowIndex}-w${wardNumber || "0"}-s${serialNumber || rowIndex}`,
    wardNumber,
    serialNumber,
    nameHindi,
    nameEnglish,
    relationshipType: getCell("relationshipType"),
    relativeNameHindi: getCell("relativeNameHindi"),
    relativeNameEnglish: getCell("relativeNameEnglish"),
    houseNumber: getCell("houseNumber"),
    age: getCell("age"),
    gender: getCell("gender")
  };

  // Privacy control: Only include voterId in the object sent to the browser if explicitly authorized
<<<<<<< HEAD
  record.voterId = getCell("voterId");

=======
  if (allowVoterId) {
    const voterIdVal = getCell("voterId");
    if (voterIdVal) {
      record.voterId = voterIdVal;
    }
  }
>>>>>>> 00be11f (Update siteConfig)

  return record;
}
