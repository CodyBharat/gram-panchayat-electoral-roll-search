/**
 * ============================================================================
 * AUTOMATED VERIFICATION SUITE (`npm test`)
 * ============================================================================
 * Verifies all search, filtering, column mapping, privacy stripping, and error
 * handling requirements against fictitious sample records.
 * ============================================================================
 */

import assert from "node:assert/strict";
import {
  processRawSheetRows,
  getElectoralRollData,
  clearElectoralRollCache,
  DataSourceError
} from "../backend/googleSheetsService.js";
import { SAMPLE_HEADERS, SAMPLE_ROWS } from "../backend/data/sampleVoters.js";
import { filterVoterRecords, normalizeHindiText, normalizeEnglishText } from "../src/utils/searchUtils.js";

async function runTests() {
  console.log("Running Gram Panchayat Electoral Roll Search Verification Suite...\n");
  let passed = 0;

  // Test 1: Sample Data Loading & Voter ID Privacy Stripping by Default
  const rollDefault = processRawSheetRows([SAMPLE_HEADERS, ...SAMPLE_ROWS], false, "SAMPLE");
  assert.equal(rollDefault.records.length, 25, "Should load all 25 fictitious sample records");
  assert.equal(rollDefault.voterIdEnabled, false, "Voter ID should be disabled by default");
  assert.equal(rollDefault.records[0].voterId, undefined, "Voter ID must not be attached to records when disabled");
  console.log("[PASS] 1. Sample data loading & default Voter ID privacy stripping");
  passed++;

  // Test 2: Voter ID Enabled when Explicitly Authorized
  const rollWithEpic = processRawSheetRows([SAMPLE_HEADERS, ...SAMPLE_ROWS], true, "SAMPLE");
  assert.equal(rollWithEpic.voterIdEnabled, true, "Voter ID should be enabled when allowVoterId=true");
  assert.equal(rollWithEpic.records[0].voterId, "TST100001", "First sample record should include Voter ID when enabled");
  console.log("[PASS] 2. Authorized Voter ID inclusion & search");
  passed++;

  const records = rollWithEpic.records;

  // Test 3: Hindi Name Search & Similar-Name Multiple Matches
  const hindiMatches = filterVoterRecords(records, { query: "राजेश शर्मा", searchScope: "VOTER_NAME" });
  assert.equal(hindiMatches.length, 2, "Searching 'राजेश शर्मा' in Voter Name should match both 'राजेश शर्मा' and 'राजेश कुमार शर्मा'");
  console.log("[PASS] 3. Hindi name search & multi-token partial matching ('राजेश शर्मा' -> 2 records)");
  passed++;

  // Test 4: English Name Search (Case-insensitive + extra spaces ignored)
  const englishMatches = filterVoterRecords(records, { query: "  rAjEsH   sHaRmA  ", searchScope: "VOTER_NAME" });
  assert.equal(englishMatches.length, 2, "Case-insensitive English search with extra spaces should match 2 records");
  console.log("[PASS] 4. English name search ignoring capitalization and extra spaces");
  passed++;

  // Test 5: Relative's Hindi and English Name Search
  const relHindiMatches = filterVoterRecords(records, { query: "रामस्वरूप मीणा", searchScope: "RELATIVE_NAME" });
  assert.equal(relHindiMatches.length, 2, "Searching relative 'रामस्वरूप मीणा' should find wife and son records");
  const relEnglishMatches = filterVoterRecords(records, { query: "Hariram Yadav", searchScope: "RELATIVE_NAME" });
  assert.equal(relEnglishMatches.length, 2, "Searching relative 'Hariram Yadav' should find 2 records");
  console.log("[PASS] 5. Relative's Hindi & English name search");
  passed++;

  // Test 6: Serial Number Search
  const serialMatches = filterVoterRecords(records, { query: "304", searchScope: "SERIAL" });
  assert.equal(serialMatches.length, 1, "Serial number 304 should match exactly 1 record");
  assert.equal(serialMatches[0].nameEnglish, "Rohit Jangid");
  console.log("[PASS] 6. Serial number search");
  passed++;

  // Test 7: Combined Ward Filter + Name Search + Gender Filter
  const combinedMatches = filterVoterRecords(records, {
    query: "मीणा",
    ward: "2",
    gender: "महिला"
  });
  assert.equal(combinedMatches.length, 2, "Ward 2 + 'मीणा' + 'महिला' should match exactly 2 female voters in Ward 2");
  console.log("[PASS] 7. Combined Ward + Name + Gender filtering");
  passed++;

  // Test 8: Missing Optional Fields Handled Without Column Shifting
  const missingFieldRec = records.find((r) => r.serialNumber === "302");
  assert.ok(missingFieldRec, "Record 302 should exist");
  assert.equal(missingFieldRec.houseNumber, "", "Missing house number should be empty string, not shifted from Age");
  assert.equal(missingFieldRec.age, "49", "Age column should remain '49' despite empty House Number");
  assert.equal(missingFieldRec.gender, "पुरुष", "Gender column should remain 'पुरुष'");
  console.log("[PASS] 8. Missing optional fields handled cleanly without shifting column values");
  passed++;

  // Test 9: Hindi Unicode Normalization Preserves Original Displayed Names
  const normA = normalizeHindiText("जाँगिड़");
  const normB = normalizeHindiText("जांगिड");
  assert.equal(normA, normB, "Devanagari Chandrabindu/Anusvara and Nukta variations should normalize identically for search");
  assert.equal(missingFieldRec.nameHindi, "सुरेश चन्द्र जांगिड़", "Original displayed Hindi name must remain untouched");
  console.log("[PASS] 9. Hindi Unicode normalization & preservation of original displayed names");
  passed++;

  // Test 10: Custom / Hindi Spreadsheet Headers Mapping
  const customHeaderRows = [
    ["वार्ड संख्या", "क्रम संख्या", "मतदाता का नाम", "नाम (अंग्रेजी)", "आयु", "लिंग"],
    ["7", "701", "मोहन लाल", "Mohan Lal", "50", "पुरुष"]
  ];
  const customProcessed = processRawSheetRows(customHeaderRows, false, "GOOGLE_SHEETS_API");
  assert.equal(customProcessed.records.length, 1);
  assert.equal(customProcessed.records[0].wardNumber, "7");
  assert.equal(customProcessed.records[0].nameHindi, "मोहन लाल");
  console.log("[PASS] 10. Configurable Hindi/English column header mapping");
  passed++;

  // Test 11: Invalid Column Headers Error Handling (Never fabricates data)
  assert.throws(
    () => {
      processRawSheetRows([["Random Column A", "Random Column B"], ["1", "2"]], false, "GOOGLE_SHEETS_API");
    },
    (err) => err instanceof DataSourceError && err.code === "INVALID_COLUMN_HEADERS",
    "Should throw INVALID_COLUMN_HEADERS when required columns are missing"
  );
  console.log("[PASS] 11. Invalid column headers error detection");
  passed++;

  // Test 12: Unconfigured GOOGLE_SHEETS_API Mode Fails Cleanly Without Returning Sample Data
  process.env.GOOGLE_SHEETS_MODE = "GOOGLE_SHEETS_API";
  process.env.GOOGLE_SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
  clearElectoralRollCache();

  let caughtError = null;
  try {
    await getElectoralRollData(true);
  } catch (err) {
    caughtError = err;
  }
  assert.ok(caughtError instanceof DataSourceError, "Should throw DataSourceError when GOOGLE_SHEET_ID is placeholder");
  assert.equal(caughtError.code, "MISSING_SHEET_ID");
  process.env.GOOGLE_SHEETS_MODE = "SAMPLE";
  clearElectoralRollCache();
  console.log("[PASS] 12. Google Sheets mode failure handling (never leaks sample data on failure)");
  passed++;

  console.log(`\nAll ${passed}/12 verification tests passed!`);
}

runTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
