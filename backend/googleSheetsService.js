/**
 * ============================================================================
 * GOOGLE SHEETS DATA-ACCESS & CACHING MODULE
 * ============================================================================
 * This module cleanly separates electoral-roll data retrieval from the search
 * interface. It supports three configurable modes via environment variables:
 *
 * 1. SAMPLE (Default for initial setup)
 *    - Loads fictitious sample records from `backend/data/sampleVoters.js`.
 *
 * 2. GOOGLE_SHEETS_API (Recommended Production Mode)
 *    - Connects privately to your Google Sheet using the Google Sheets API v4
 *      and a Google Cloud Service Account.
 *    - Keeps your spreadsheet completely private (never published to the web).
 *    - Keeps credentials strictly in backend environment variables.
 *
 * 3. PUBLIC_CSV (Optional Alternative)
 *    - Fetches a published CSV link.
 *    - WARNING: Requires publishing the sheet to the web, which means anyone
 *      with the link could download the full spreadsheet.
 *
 * CRITICAL SAFETY GUARANTEE:
 * - If GOOGLE_SHEETS_MODE is set to GOOGLE_SHEETS_API or PUBLIC_CSV and an
 *   error occurs (e.g., missing credentials, wrong Sheet ID, wrong Tab name,
 *   permission denied, or invalid headers), this service NEVER falls back to
 *   fictitious sample records. It throws a clear, actionable error code.
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { resolveHeaderMap, mapRowToRecord } from "./columnMapping.js";
import { SAMPLE_HEADERS, SAMPLE_ROWS } from "./data/sampleVoters.js";

// In-memory server cache to avoid re-downloading the entire Google Sheet on every request
let cachedPayload = null;
let cacheTimestamp = 0;

/**
 * Custom structured error class for clear troubleshooting on the frontend and logs.
 */
export class DataSourceError extends Error {
  constructor(code, messageEn, messageHi, troubleshootingSteps = [], statusCode = 500) {
    super(messageEn);
    this.name = "DataSourceError";
    this.code = code;
    this.messageEn = messageEn;
    this.messageHi = messageHi;
    this.troubleshootingSteps = troubleshootingSteps;
    this.statusCode = statusCode;
  }
}

/**
 * Parses a standard CSV string (handling quoted fields and commas inside quotes)
 * for the optional PUBLIC_CSV mode.
 */
export function parseCsvString(csvText = "") {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentVal);
        currentVal = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        if (char === "\r") i++;
        currentRow.push(currentVal);
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
      } else if (char === "\r") {
        currentRow.push(currentVal);
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Validates raw rows (Row 1 = headers, Row 2+ = voter records) and transforms
 * them into normalized voter objects.
 */
export function processRawSheetRows(rawRows, allowVoterId = false, sourceMode = "SAMPLE") {
  if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) {
    throw new DataSourceError(
      "EMPTY_SPREADSHEET",
      "The spreadsheet or specified tab is completely empty.",
      "स्प्रेडशीट या चुना गया टैब पूरी तरह से खाली है।",
      [
        "Verify that Row 1 of your Google Sheet contains column headers (such as Ward Number, Serial Number, Name in Hindi, etc.).",
        "Verify that GOOGLE_SHEET_TAB_NAME matches the exact tab containing your data."
      ],
      422
    );
  }

  const rawHeaders = rawRows[0];
  const headerResolution = resolveHeaderMap(rawHeaders);

  if (!headerResolution.isValid) {
    throw new DataSourceError(
      "INVALID_COLUMN_HEADERS",
      `Required column headers are missing or unrecognized in Row 1: ${headerResolution.missingRequired.join(", ")}. Found headers: [${rawHeaders.join(", ")}]`,
      `पंक्ति 1 (Row 1) में आवश्यक कॉलम हेडर अनुपस्थित या अमान्य हैं: ${headerResolution.missingRequired.join(", ")}।`,
      [
        "Check Row 1 of your Google Sheet to ensure column headers are in the very first row.",
        "If your spreadsheet uses custom column names, add them to `backend/columnMapping.js` under `acceptedHeaders`."
      ],
      422
    );
  }

  const dataRows = rawRows.slice(1);
  const records = [];

  for (let i = 0; i < dataRows.length; i++) {
    const mapped = mapRowToRecord(dataRows[i], headerResolution.fieldToIndex, i + 2, allowVoterId);
    if (mapped) {
      records.push(mapped);
    }
  }

  if (records.length === 0) {
    throw new DataSourceError(
      "NO_VOTER_ROWS",
      "Column headers were found in Row 1, but no voter records were found in rows 2 and below.",
      "पंक्ति 1 में कॉलम हेडर मिले, लेकिन पंक्ति 2 और उसके नीचे कोई मतदाता रिकॉर्ड नहीं मिला।",
      [
        "Ensure voter rows exist starting from Row 2 in your Google Sheet."
      ],
      422
    );
  }

  // Extract unique sorted ward numbers, genders, and relationship types for filter dropdowns
  const wardSet = new Set();
  const genderSet = new Set();
  const relationshipSet = new Set();

  for (const rec of records) {
    if (rec.wardNumber) wardSet.add(rec.wardNumber);
    if (rec.gender) genderSet.add(rec.gender);
    if (rec.relationshipType) relationshipSet.add(rec.relationshipType);
  }

  const wards = Array.from(wardSet).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return {
    sourceMode,
    isSampleData: sourceMode === "SAMPLE",
    voterIdEnabled: Boolean(allowVoterId && headerResolution.fieldToIndex.voterId !== undefined),
    totalRecords: records.length,
    wards,
    genders: Array.from(genderSet),
    relationshipTypes: Array.from(relationshipSet),
    lastUpdated: new Date().toISOString(),
    records
  };
}

/**
 * Fetches rows privately from Google Sheets API v4 using a Service Account.
 */
async function fetchFromGoogleSheetsApi(config) {
  const { sheetId, tabName, serviceAccountEmail, privateKey, credentialsPath } = config;

  if (!sheetId || sheetId === "YOUR_GOOGLE_SHEET_ID_HERE") {
    throw new DataSourceError(
      "MISSING_SHEET_ID",
      "GOOGLE_SHEET_ID is not configured in your .env file.",
      "आपकी .env फ़ाइल में GOOGLE_SHEET_ID कॉन्फ़िगर नहीं किया गया है।",
      [
        "Open your `.env` file in VS Code.",
        "Set GOOGLE_SHEET_ID to the string between `/d/` and `/edit` in your Google Sheet URL."
      ],
      400
    );
  }

  if (!tabName) {
    throw new DataSourceError(
      "MISSING_TAB_NAME",
      "GOOGLE_SHEET_TAB_NAME is not configured in your .env file.",
      "आपकी .env फ़ाइल में GOOGLE_SHEET_TAB_NAME कॉन्फ़िगर नहीं किया गया है।",
      [
        "Open your `.env` file and set GOOGLE_SHEET_TAB_NAME to the exact tab name at the bottom of your Google Sheet (e.g., Sheet1)."
      ],
      400
    );
  }

  let authClient;

  try {
    if (credentialsPath) {
      const resolvedPath = path.resolve(process.cwd(), credentialsPath);
      if (!fs.existsSync(resolvedPath)) {
        throw new DataSourceError(
          "CREDENTIALS_FILE_NOT_FOUND",
          `Service account JSON file not found at path: ${credentialsPath}`,
          `सर्विस अकाउंट JSON फ़ाइल निर्दिष्ट पथ पर नहीं मिली: ${credentialsPath}`,
          [
            "Check GOOGLE_APPLICATION_CREDENTIALS_PATH in your `.env` file.",
            "Ensure the file exists locally and is listed in `.gitignore`."
          ],
          400
        );
      }
      const auth = new google.auth.GoogleAuth({
        keyFile: resolvedPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
      });
      authClient = await auth.getClient();
    } else if (
      serviceAccountEmail &&
      serviceAccountEmail !== "your-service-account@your-project-id.iam.gserviceaccount.com" &&
      privateKey &&
      !privateKey.includes("YOUR_PRIVATE_KEY_HERE")
    ) {
      const formattedKey = privateKey.replace(/\\n/g, "\n");
      authClient = new google.auth.JWT({
        email: serviceAccountEmail,
        key: formattedKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
      });
    } else {
      throw new DataSourceError(
        "MISSING_GOOGLE_CREDENTIALS",
        "Google Service Account credentials are missing or still set to placeholders in .env.",
        ".env फ़ाइल में Google सर्विस अकाउंट क्रेडेंशियल अनुपस्थित हैं या अभी भी प्लेसहोल्डर पर सेट हैं।",
        [
          "In `.env`, provide either GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY, OR set GOOGLE_APPLICATION_CREDENTIALS_PATH to your downloaded JSON key file.",
          "Share your Google Sheet (Viewer permission) with the Service Account email address."
        ],
        401
      );
    }
  } catch (err) {
    if (err instanceof DataSourceError) throw err;
    throw new DataSourceError(
      "AUTH_INITIALIZATION_FAILED",
      `Failed to initialize Google Service Account authentication: ${err.message}`,
      `Google सर्विस अकाउंट प्रमाणीकरण प्रारंभ करने में विफल: ${err.message}`,
      [
        "Verify that your GOOGLE_PRIVATE_KEY is enclosed in quotes and preserves `\n` newline characters.",
        "Or use GOOGLE_APPLICATION_CREDENTIALS_PATH pointing to your valid service-account JSON file."
      ],
      401
    );
  }

  const sheets = google.sheets({ version: "v4", auth: authClient });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tabName}'!A:Z`
    });

    return response.data.values || [];
  } catch (apiErr) {
    const status = apiErr?.code || apiErr?.response?.status;
    const apiMessage = apiErr?.response?.data?.error?.message || apiErr.message || "Unknown Google API error";

    if (status === 403) {
      throw new DataSourceError(
        "GOOGLE_SHEETS_ACCESS_DENIED",
        `Access denied (403) when accessing Google Sheet. Details: ${apiMessage}`,
        `Google शीट तक पहुँचने की अनुमति अस्वीकृत (403)। विवरण: ${apiMessage}`,
        [
          "Open your Google Sheet in your browser, click the 'Share' button, and share it as 'Viewer' with your Service Account email address.",
          "Ensure the Google Sheets API is enabled in your Google Cloud Console project."
        ],
        403
      );
    }

    if (status === 404) {
      throw new DataSourceError(
        "SPREADSHEET_NOT_FOUND",
        `Spreadsheet not found (404). Please verify GOOGLE_SHEET_ID. Details: ${apiMessage}`,
        `स्प्रेडशीट नहीं मिली (404)। कृपया GOOGLE_SHEET_ID की जाँच करें। विवरण: ${apiMessage}`,
        [
          "Check GOOGLE_SHEET_ID in your `.env` file. Make sure you copied only the ID between `/d/` and `/edit`, not the full URL."
        ],
        404
      );
    }

    if (status === 400 && apiMessage.toLowerCase().includes("unable to parse range")) {
      throw new DataSourceError(
        "INVALID_TAB_NAME",
        `The tab name '${tabName}' was not found in the spreadsheet. Details: ${apiMessage}`,
        `स्प्रेडशीट में टैब नाम '${tabName}' नहीं मिला।`,
        [
          `Check the exact spelling and capitalization of the tab at the bottom of your Google Sheet and update GOOGLE_SHEET_TAB_NAME in .env.`
        ],
        400
      );
    }

    throw new DataSourceError(
      "GOOGLE_SHEETS_API_ERROR",
      `Failed to load data from Google Sheets API: ${apiMessage}`,
      `Google Sheets API से डेटा लोड करने में त्रुटि: ${apiMessage}`,
      [
        "Check your internet connection, GOOGLE_SHEET_ID, GOOGLE_SHEET_TAB_NAME, and Service Account permissions."
      ],
      502
    );
  }
}

/**
 * Fetches rows from an optional published CSV link.
 */
async function fetchFromPublicCsv(publicCsvUrl) {
  if (!publicCsvUrl || !publicCsvUrl.startsWith("http")) {
    throw new DataSourceError(
      "MISSING_PUBLIC_CSV_URL",
      "GOOGLE_SHEET_PUBLIC_CSV_URL is missing or invalid in your .env file.",
      "आपकी .env फ़ाइल में GOOGLE_SHEET_PUBLIC_CSV_URL अनुपस्थित या अमान्य है।",
      [
        "If using PUBLIC_CSV mode, set GOOGLE_SHEET_PUBLIC_CSV_URL to a valid published CSV link.",
        "Note: For privacy, we strongly recommend using GOOGLE_SHEETS_MODE=GOOGLE_SHEETS_API instead."
      ],
      400
    );
  }

  let response;
  try {
    response = await fetch(publicCsvUrl);
  } catch (netErr) {
    throw new DataSourceError(
      "NETWORK_FAILURE",
      `Network error while fetching CSV URL: ${netErr.message}`,
      `CSV URL से डेटा प्राप्त करते समय नेटवर्क त्रुटि: ${netErr.message}`,
      ["Check your internet connection and verify that the CSV URL is reachable."],
      502
    );
  }

  if (!response.ok) {
    throw new DataSourceError(
      "CSV_FETCH_FAILED",
      `Failed to fetch CSV URL (HTTP ${response.status}).`,
      `CSV URL प्राप्त करने में विफल (HTTP ${response.status})।`,
      [
        "Ensure you did not paste a regular Google Sheets edit URL. A regular URL returns HTML, not CSV data.",
        "For private access without publishing your sheet, switch GOOGLE_SHEETS_MODE to GOOGLE_SHEETS_API."
      ],
      response.status
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("text/html") || text.trim().startsWith("<!DOCTYPE html")) {
    throw new DataSourceError(
      "INVALID_CSV_RESPONSE_HTML",
      "The configured URL returned an HTML web page instead of CSV spreadsheet data. Copying a regular Google Sheet URL is not sufficient.",
      "कॉन्फ़िगर किए गए URL ने CSV डेटा के बजाय एक HTML वेब पेज लौटाया। सामान्य Google Sheet URL कॉपी करना पर्याप्त नहीं है।",
      [
        "Do not paste a regular Google Sheets URL into GOOGLE_SHEET_PUBLIC_CSV_URL.",
        "Recommended: Use GOOGLE_SHEETS_MODE=GOOGLE_SHEETS_API with a Service Account so your sheet remains private."
      ],
      400
    );
  }

  return parseCsvString(text);
}

/**
 * Main entry point to retrieve electoral roll data with caching.
 */
export async function getElectoralRollData(forceRefresh = false) {
  const mode = (process.env.GOOGLE_SHEETS_MODE || "SAMPLE").trim().toUpperCase();
  const allowVoterId = String(process.env.ALLOW_VOTER_ID_DISPLAY || "false").trim().toLowerCase() === "true";
  const cacheTtlMs = (parseInt(process.env.CACHE_TTL_SECONDS || "300", 10) || 300) * 1000;

  const now = Date.now();
  if (
    !forceRefresh &&
    cachedPayload &&
    cachedPayload.sourceMode === mode &&
    cachedPayload.voterIdEnabled === allowVoterId &&
    now - cacheTimestamp < cacheTtlMs
  ) {
    return cachedPayload;
  }

  let rawRows = [];

  if (mode === "SAMPLE") {
    rawRows = [SAMPLE_HEADERS, ...SAMPLE_ROWS];
  } else if (mode === "GOOGLE_SHEETS_API") {
    rawRows = await fetchFromGoogleSheetsApi({
      sheetId: (process.env.GOOGLE_SHEET_ID || "").trim(),
      tabName: (process.env.GOOGLE_SHEET_TAB_NAME || "").trim(),
      serviceAccountEmail: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim(),
      privateKey: process.env.GOOGLE_PRIVATE_KEY || "",
      credentialsPath: (process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH || "").trim()
    });
  } else if (mode === "PUBLIC_CSV") {
    rawRows = await fetchFromPublicCsv((process.env.GOOGLE_SHEET_PUBLIC_CSV_URL || "").trim());
  } else {
    throw new DataSourceError(
      "INVALID_GOOGLE_SHEETS_MODE",
      `Unsupported GOOGLE_SHEETS_MODE '${mode}'. Allowed values are SAMPLE, GOOGLE_SHEETS_API, or PUBLIC_CSV.`,
      `अमान्य GOOGLE_SHEETS_MODE '${mode}'। केवल SAMPLE, GOOGLE_SHEETS_API, या PUBLIC_CSV मान्य हैं।`,
      ["Open `.env` and set GOOGLE_SHEETS_MODE to SAMPLE or GOOGLE_SHEETS_API."],
      400
    );
  }

  const processed = processRawSheetRows(rawRows, allowVoterId, mode);
  cachedPayload = processed;
  cacheTimestamp = now;

  return processed;
}

export function clearElectoralRollCache() {
  cachedPayload = null;
  cacheTimestamp = 0;
}
