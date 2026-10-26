import React from "react";
import { TRANSLATIONS } from "../config/translations.js";

/**
 * Individual Vertical Result Card (`VoterCard.jsx`)
 * - Displays exactly ONE voter record in a vertical label/value layout.
 * - Never uses a wide horizontal table.
 * - Preserves original Hindi and English names from the spreadsheet without alteration.
 * - Displays Voter ID / EPIC Number ONLY when present and authorized by backend config.
 * - Handles missing optional fields cleanly.
 */
export default function VoterCard({ record, language, voterIdEnabled }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;
  const f = t.fields;

  const displayValue = (val) => {
    const trimmed = val !== null && val !== undefined ? String(val).trim() : "";
    return trimmed ? trimmed : f.notAvailable;
  };

  // Build ordered vertical rows for the card
  const rows = [
    { key: "wardNumber", label: f.wardNumber, value: displayValue(record.wardNumber), highlight: true },
    { key: "serialNumber", label: f.serialNumber, value: displayValue(record.serialNumber), highlight: true }
  ];

<<<<<<< HEAD
  // Include Voter ID in the fields list only if available on the record
  if (record.voterId) {
=======
  // Include Voter ID only if authorized and available on the record
      console.log("Keys:", Object.keys(record), "Data:", JSON.stringify(record));

  if (record.voterId) {

>>>>>>> 00be11f (Update siteConfig)
    rows.push({
      key: "voterId",
      label: f.voterId,
      value: displayValue(record.voterId),
      highlight: false
    });
  }

  rows.push(
    { key: "nameHindi", label: f.nameHindi, value: displayValue(record.nameHindi), isPrimaryName: true },
    { key: "nameEnglish", label: f.nameEnglish, value: displayValue(record.nameEnglish), isPrimaryName: true },
    { key: "relationshipType", label: f.relationshipType, value: displayValue(record.relationshipType) },
    { key: "relativeNameHindi", label: f.relativeNameHindi, value: displayValue(record.relativeNameHindi) },
    { key: "relativeNameEnglish", label: f.relativeNameEnglish, value: displayValue(record.relativeNameEnglish) },
    { key: "houseNumber", label: f.houseNumber, value: displayValue(record.houseNumber) },
    { key: "age", label: f.age, value: displayValue(record.age) },
    { key: "gender", label: f.gender, value: displayValue(record.gender) }
  );

  return (
    <article
      className="voter-card"
      aria-label={`${f.nameHindi}: ${record.nameHindi || record.nameEnglish}`}
    >
      <div className="voter-card-top-bar">
        <span className="voter-card-ward-pill">
          {f.wardNumber}: <strong>{displayValue(record.wardNumber)}</strong>
        </span>
        <span className="voter-card-serial-pill">
          {f.serialNumber}: <strong>{displayValue(record.serialNumber)}</strong>
        </span>
<<<<<<< HEAD
        {record.voterId && (
          <span className="voter-card-serial-pill">
            {f.voterId}: <strong>{displayValue(record.voterId)}</strong>
          </span>
        )}
=======
>>>>>>> 00be11f (Update siteConfig)
      </div>

      <dl className="voter-card-fields">
        {rows.map((item) => (
          <div
            key={item.key}
            className={`voter-field-row ${item.isPrimaryName ? "primary-name-row" : ""}`}
          >
            <dt className="voter-field-label">{item.label}:</dt>
            <dd className="voter-field-value">{item.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
