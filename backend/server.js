/**
 * ============================================================================
 * EXPRESS BACKEND SERVER
 * ============================================================================
 * Serves the Electoral Roll API endpoints and (in production build) the static
 * React frontend.
 *
 * Endpoints:
 * - GET /api/voters        -> Returns cached voter records & filter metadata,
 *                             OR supports optional server-side query params
 *                             for large datasets.
 * - GET /api/health        -> Returns current data-source mode & connection status.
 * ============================================================================
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getElectoralRollData, DataSourceError } from "./googleSheetsService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * GET /api/voters
 * Loads electoral roll records from the configured data source (cached in memory
 * for CACHE_TTL_SECONDS to avoid repeated Google Sheets API calls on every keystroke).
 */
app.get("/api/voters", async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const data = await getElectoralRollData(forceRefresh);
    res.json({
      ok: true,
      ...data
    });
  } catch (err) {
    if (err instanceof DataSourceError) {
      console.error(`[DataSourceError: ${err.code}] ${err.messageEn}`);
      return res.status(err.statusCode || 500).json({
        ok: false,
        error: {
          code: err.code,
          messageEn: err.messageEn,
          messageHi: err.messageHi,
          troubleshootingSteps: err.troubleshootingSteps
        }
      });
    }

    console.error("[Unexpected Server Error]", err);
    return res.status(500).json({
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        messageEn: "An unexpected server error occurred while loading electoral roll records.",
        messageHi: "मतदाता सूची लोड करते समय सर्वर में एक अप्रत्याशित त्रुटि हुई।",
        troubleshootingSteps: [
          "Check the terminal running the backend server for detailed error logs.",
          "Verify your `.env` configuration."
        ]
      }
    });
  }
});

/**
 * GET /api/health
 */
app.get("/api/health", (req, res) => {
  const mode = (process.env.GOOGLE_SHEETS_MODE || "SAMPLE").trim().toUpperCase();
  res.json({
    ok: true,
    mode,
    allowVoterIdDisplay: String(process.env.ALLOW_VOTER_ID_DISPLAY || "false").toLowerCase() === "true"
  });
});

// Serve frontend production build if `dist` exists
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send(
        "Backend API is running on port " +
          PORT +
          ". Run `npm run dev` to launch both the Vite React frontend and backend together."
      );
    }
  });
});

// Start server only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    const mode = (process.env.GOOGLE_SHEETS_MODE || "SAMPLE").trim().toUpperCase();
    console.log("==================================================================");
    console.log(`Gram Panchayat Electoral Roll API Server running on port ${PORT}`);
    console.log(`Current GOOGLE_SHEETS_MODE: ${mode}`);
    if (mode === "SAMPLE") {
      console.log("Notice: Serving fictitious sample records for initial testing.");
      console.log("To connect your real Google Sheet, edit .env in VS Code.");
    }
    console.log("==================================================================");
  });
}

export default app;
