/**
 * ============================================================================
 * FRONTEND DATA-ACCESS LAYER (`voterDataService.js`)
 * ============================================================================
 * Communicates with the backend `/api/voters` endpoint, caches the loaded
 * dataset in memory so typing in the search box never triggers redundant
 * network downloads, and normalizes network/backend errors into user-friendly
 * messages.
 * ============================================================================
 */

let clientCache = null;

export async function fetchElectoralRoll(forceRefresh = false) {
  if (!forceRefresh && clientCache) {
    return clientCache;
  }
const BACKEND_URL = https://gram-panchayat-electoral-roll-search.onrender.com;
const endpoint = forceRefresh ? `${BACKEND_URL}/api/voters?refresh=true` : `${BACKEND_URL}/api/voters`;


  let response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
  } catch (networkErr) {
    const err = new Error("Network failure while connecting to the electoral roll server.");
    err.structuredError = {
      code: "NETWORK_ERROR",
      messageEn: "Could not reach the backend server. Please check your connection or ensure the backend server is running (`npm run dev`).",
      messageHi: "बैकएंड सर्वर से संपर्क नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जाँचें या सुनिश्चित करें कि सर्वर चल रहा है (`npm run dev`)।",
      troubleshootingSteps: [
        "In VS Code terminal, make sure `npm run dev` is running without errors.",
        "Verify that port 3001 is not blocked by another program."
      ]
    };
    throw err;
  }

  let payload;
  try {
    payload = await response.json();
  } catch (parseErr) {
    const err = new Error("Invalid JSON response from server.");
    err.structuredError = {
      code: "INVALID_SERVER_RESPONSE",
      messageEn: "Received an invalid response from the backend server.",
      messageHi: "सर्वर से अमान्य प्रतिक्रिया प्राप्त हुई।",
      troubleshootingSteps: [
        "Ensure both the backend server and frontend are running via `npm run dev`."
      ]
    };
    throw err;
  }

  if (!response.ok || !payload.ok) {
    const err = new Error(payload?.error?.messageEn || "Failed to load voter records.");
    err.structuredError = payload?.error || {
      code: "DATA_LOAD_FAILED",
      messageEn: "Failed to load voter records from the configured data source.",
      messageHi: "कॉन्फ़िगर किए गए डेटा स्रोत से मतदाता रिकॉर्ड लोड करने में विफल।",
      troubleshootingSteps: [
        "Check your `.env` file settings for GOOGLE_SHEETS_MODE, GOOGLE_SHEET_ID, and GOOGLE_SHEET_TAB_NAME."
      ]
    };
    throw err;
  }

  clientCache = payload;
  return payload;
}

export function clearClientCache() {
  clientCache = null;
}
