# Gram Panchayat Electoral Roll Search Website (ग्राम पंचायत मतदाता सूची खोज)

A complete, mobile-first, bilingual (Hindi & English) **Gram Panchayat Electoral Roll Search Website** built with **React (Vite)** on the frontend and **Node.js + Express + Google Sheets API v4** on the backend.

---

## 1. Important Note on Current Data Status

- **Tested with Fictitious Sample Data Only:** By default (`GOOGLE_SHEETS_MODE=SAMPLE`), the project runs immediately out-of-the-box using **25 fictitious sample voter records** located in `backend/data/sampleVoters.js`.
- **Your Real Google Sheet Is Not Connected Yet:** For your privacy, no real voter records, spreadsheet URLs, or credentials are included in this project.
- **Zero Code Rewrite Required to Connect Your Sheet:** A cleanly separated backend data-access layer (`backend/googleSheetsService.js` and `backend/columnMapping.js`) is ready for you to connect your real Google Sheet in VS Code by editing `.env`. When you switch `GOOGLE_SHEETS_MODE=GOOGLE_SHEETS_API`, the sample data is completely bypassed, and if any connection error occurs, the app displays an actionable error banner rather than fabricated records.

---

## 2. Project Folder Structure

```text
gram-panchayat-electoral-roll-search/
├── backend/
│   ├── data/
│   │   └── sampleVoters.js          # Fictitious sample data (used ONLY when GOOGLE_SHEETS_MODE=SAMPLE)
│   ├── columnMapping.js             # Configurable mapping from spreadsheet Row 1 headers to internal fields
│   ├── googleSheetsService.js       # Google Sheets API v4 integration, CSV fallback, validation & caching
│   └── server.js                    # Express API server (/api/voters, /api/health) & production static server
├── public/
│   └── assets/
│       └── README-ASSETS.txt        # Place your optional candidate banner or background image here
├── src/
│   ├── components/
│   │   ├── CandidateBanner.jsx      # Static candidate banner (below header, above search; auto-hides if empty)
│   │   ├── ErrorBanner.jsx          # Actionable bilingual error & troubleshooting component
│   │   ├── Footer.jsx               # Code-configurable footer slogan component
│   │   ├── Header.jsx               # Professional header with Hindi / English language toggle
│   │   ├── SearchAndFilters.jsx     # Search bar, voice button, Ward/Gender/Relationship filters & Clear button
│   │   ├── VoiceSearchButton.jsx    # Web Speech API (hi-IN / en-IN) microphone integration with fallbacks
│   │   └── VoterCard.jsx            # Individual vertical result card for each matching voter
│   ├── config/
│   │   ├── siteConfig.js            # Code-only settings: Banner URL, Background URL, Title, Subtitle, Slogan
│   │   └── translations.js          # Complete Hindi & English UI dictionary
│   ├── services/
│   │   └── voterDataService.js      # Frontend API client & client-side caching
│   ├── styles/
│   │   └── main.css                 # Responsive mobile-first styling, Devanagari fonts, card layout
│   ├── utils/
│   │   └── searchUtils.js           # Hindi Unicode normalization, partial matching, multi-filter logic
│   ├── App.jsx                      # Main application state, pagination (Load More), and layout
│   └── main.jsx                     # React entry point
├── tests/
│   └── runTests.js                  # Automated verification suite for search, filtering & error handling
├── .env.example                     # Template for environment variables (copy to .env)
├── .gitignore                       # Prevents .env, credentials, and node_modules from being committed
├── index.html                       # HTML entry with Noto Sans Devanagari & Noto Sans fonts
├── package.json                     # Dependencies and npm scripts
├── vite.config.js                   # Vite configuration with /api proxy to backend port 3001
└── README.md                        # Complete setup, customization, privacy, and deployment guide
```

---

## 3. Quick Start: Running Locally in VS Code

### Prerequisites
- Install **Node.js (v18 or newer)** from [https://nodejs.org](https://nodejs.org)
- Install **Visual Studio Code (VS Code)**

### Step-by-Step Commands
1. Extract the downloaded ZIP file and open the `gram-panchayat-electoral-roll-search` folder in **VS Code** (`File -> Open Folder...`).
2. Open the integrated terminal in VS Code (`Terminal -> New Terminal` or press `` Ctrl + ` ``).
3. Create your local `.env` file by copying `.env.example`:
   - **Windows (Command Prompt / PowerShell):**
     ```powershell
     copy .env.example .env
     ```
   - **macOS / Linux / Git Bash:**
     ```bash
     cp .env.example .env
     ```
4. Install all project dependencies:
   ```bash
   npm install
   ```
5. Run the automated verification tests (optional, verifies search & filtering with sample data):
   ```bash
   npm test
   ```
6. Start both the Backend API Server (`http://localhost:3001`) and Frontend Vite Dev Server (`http://localhost:5173`):
   ```bash
   npm run dev
   ```
7. Open **`http://localhost:5173`** in your browser. The website will load with the 25 fictitious sample records so you can immediately test Hindi search, English search, Ward filters, Voice search, and Language switching.

---

## 4. How to Connect Your Real Google Sheet (Recommended Private Method)

Simply copying the regular browser URL of a Google Sheet is **not** enough to load private spreadsheet data, and publishing your voter sheet to the public web exposes the entire spreadsheet to download.

Instead, follow these steps to connect your private Google Sheet securely using a **Google Cloud Service Account** on the backend:

### Step 4.1: Obtain Your `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_TAB_NAME`
1. Open your Google Sheet in your browser.
2. Look at the address bar URL. It looks like this:
   ```text
   https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_1234567890/edit#gid=0
   ```
3. Copy the string between `/d/` and `/edit`. That is your **`GOOGLE_SHEET_ID`**:
   ```text
   1aBcDeFgHiJkLmNoPqRsTuVwXyZ_1234567890
   ```
4. Look at the bottom-left tab bar of your Google Sheet to find the exact name of the worksheet tab (for example, `Sheet1` or `ElectoralRoll`). That is your **`GOOGLE_SHEET_TAB_NAME`**.

### Step 4.2: Create a Google Cloud Service Account & Enable Google Sheets API
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing project).
3. In the left sidebar, go to **APIs & Services -> Library**, search for **Google Sheets API**, and click **Enable**.
4. Go to **APIs & Services -> Credentials**.
5. Click **+ Create Credentials -> Service account**.
   - Enter a name (e.g., `electoral-roll-reader`) and click **Create and Continue**, then **Done**.
6. In the Service Accounts list, click on the newly created Service Account email address (it looks like `electoral-roll-reader@your-project.iam.gserviceaccount.com`).
7. Go to the **Keys** tab at the top -> click **Add Key -> Create new key -> JSON -> Create**.
8. A `.json` file will download to your computer. **Keep this file secret!**

### Step 4.3: Share Your Google Sheet with the Service Account Email
1. Open your Google Sheet in the browser.
2. Click the **Share** button (top right).
3. Paste the `client_email` from your Service Account (e.g., `electoral-roll-reader@your-project.iam.gserviceaccount.com`).
4. Set the permission role to **Viewer** (read-only) and click **Send / Share**.
   *(Your Google Sheet remains completely private to the general public, while your backend server can read it.)*

### Step 4.4: Configure Your `.env` File in VS Code
Open your `.env` file in VS Code and update the settings:

```env
GOOGLE_SHEETS_MODE=GOOGLE_SHEETS_API
GOOGLE_SHEET_ID=paste_your_spreadsheet_id_here
GOOGLE_SHEET_TAB_NAME=Sheet1
```

Then provide your Service Account credentials using **either Option A or Option B**:

- **Option A (Environment Variables — Best for Cloud Deployment & Local Use):**
  Open your downloaded `.json` key file in a text editor, copy `client_email` and `private_key`, and paste them into `.env`:
  ```env
  GOOGLE_SERVICE_ACCOUNT_EMAIL=electoral-roll-reader@your-project.iam.gserviceaccount.com
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG...
-----END PRIVATE KEY-----
"
  ```
- **Option B (Local JSON File Path):**
  Save your downloaded JSON file inside the project root as `google-credentials.json` (which is already ignored by `.gitignore`) and set in `.env`:
  ```env
  GOOGLE_APPLICATION_CREDENTIALS_PATH=./google-credentials.json
  ```

Restart the server (`Ctrl + C` then `npm run dev`). Your real Google Sheet is now connected!

### Step 4.5: Customizing Column Headers (`backend/columnMapping.js`)
Row 1 of your Google Sheet must contain column headers. By default, `backend/columnMapping.js` automatically recognizes both English and Hindi header variations for:
- **Ward Number** (`Ward Number`, `Ward No`, `वार्ड संख्या`, `वार्ड`, etc.)
- **Serial Number** (`Serial Number`, `Serial No`, `S.No`, `क्रम संख्या`, `क्रमांक`, etc.)
- **Voter ID / EPIC Number** (`Voter ID`, `EPIC Number`, `मतदाता पहचान पत्र संख्या`, etc.)
- **Name in Hindi** (`Name in Hindi`, `नाम (हिंदी)`, `मतदाता का नाम`, `नाम`, etc.)
- **Name in English** (`Name in English`, `Name (English)`, `Name`, `नाम (अंग्रेजी)`, etc.)
- **Relationship Type** (`Relationship Type`, `Relationship`, `संबंध का प्रकार`, `संबंध`, etc.)
- **Relative’s Name in Hindi** (`Relative’s Name in Hindi`, `संबंधी का नाम (हिंदी)`, `पिता/पति का नाम`, etc.)
- **Relative’s Name in English** (`Relative’s Name in English`, `Relative Name`, `संबंधी का नाम (अंग्रेजी)`, etc.)
- **House Number** (`House Number`, `House No`, `मकान संख्या`, etc.)
- **Age** (`Age`, `आयु`, `उम्र`, etc.)
- **Gender** (`Gender`, `Sex`, `लिंग`, etc.)

If your spreadsheet uses a different header name in Row 1, either rename the header in Row 1 of your Google Sheet OR add your header name to the corresponding `acceptedHeaders` list in `backend/columnMapping.js`.

---

## 5. Optional Alternative: Public CSV Mode (`PUBLIC_CSV`) & Privacy Warning

If you choose not to use a Google Cloud Service Account, the backend also supports `GOOGLE_SHEETS_MODE=PUBLIC_CSV` using a link generated via **File -> Share -> Publish to web -> Comma-separated values (.csv)**.

> **Important Privacy Warning:** Publishing a Google Sheet to the web makes the entire CSV dataset publicly accessible to anyone who obtains the link. Do **not** paste a normal Google Sheet edit URL into `GOOGLE_SHEET_PUBLIC_CSV_URL` (a normal URL returns an HTML login page, which the backend will reject with a clear error). Whenever privacy matters, use **`GOOGLE_SHEETS_MODE=GOOGLE_SHEETS_API`** instead.

---

## 6. How to Customize the Banner, Background Image, Header Title, Subtitle, and Footer Slogan

All visual customizations are controlled strictly via code in **`src/config/siteConfig.js`** (visitors cannot edit them on the website):

1. **Candidate Publicity Banner (`CANDIDATE_BANNER_URL`):**
   - Place your single banner image inside `public/assets/` (for example, `public/assets/banner.jpg`).
   - Open `src/config/siteConfig.js` and set:
     ```js
     export const CANDIDATE_BANNER_URL = "/assets/banner.jpg";
     ```
   - Or paste a full `https://...` image URL.
   - The banner renders below the header and above the search section using `object-fit: contain` so faces, text, and aspect ratio are preserved on all screen sizes. If left as `""` or if the image fails to load, the banner hides cleanly.

2. **Optional Background Image (`BACKGROUND_IMAGE_URL`):**
   - Place your background image in `public/assets/bg.jpg` and set in `src/config/siteConfig.js`:
     ```js
     export const BACKGROUND_IMAGE_URL = "/assets/bg.jpg";
     ```
   - A high-contrast translucent backdrop overlay is automatically applied when a background image is active so text and voter cards remain easy to read. If left empty (`""`) or broken, it falls back to a clean solid background.

3. **Website Header Title & Subtitle (`WEBSITE_HEADER`):**
   - Edit `WEBSITE_HEADER.title` and `WEBSITE_HEADER.subtitle` in `src/config/siteConfig.js` for both Hindi (`hi`) and English (`en`).

4. **Footer Slogan (`FOOTER_SLOGAN`):**
   - Edit `FOOTER_SLOGAN` in `src/config/siteConfig.js` to change the Hindi and English footer message.

---

## 7. Privacy, Security & Large Dataset Architecture Notes

1. **Protecting Credentials:**
   - Never put `GOOGLE_PRIVATE_KEY` or Service Account JSON files inside `src/` (frontend code). Keep them strictly in `.env` on the server.
   - `.gitignore` is pre-configured to exclude `.env` and `*credentials*.json`.
2. **Voter ID / EPIC Number Exposure:**
   - Hiding a field purely in CSS or React UI does **not** prevent a user from opening Browser Developer Tools (`F12 -> Network`) and reading the JSON response.
   - Therefore, this project enforces `ALLOW_VOTER_ID_DISPLAY=false` on the **backend** (`backend/columnMapping.js`): unless you explicitly set `ALLOW_VOTER_ID_DISPLAY=true` in `.env`, the backend strips the Voter ID column before sending JSON data to the browser.
3. **Public Deployment Implications:**
   - Understand that any electoral-roll data served to a public search website can be queried and extracted by visitors. A search interface or individual card layout improves usability, not cryptographic privacy. Ensure you are authorized to publish the fields enabled in your deployment.
4. **Caching & Large Datasets:**
   - The backend caches the loaded Google Sheet in memory for `CACHE_TTL_SECONDS` (default 5 minutes = 300 seconds) and the frontend caches the dataset per session so typing in the search box never triggers repeated Google Sheets API calls.
   - Typical Gram Panchayat rolls (1,000 to 10,000 voters) filter instantaneously in memory and render smoothly via the `RESULTS_PER_PAGE` "Load More" pagination. If you ever scale to a constituency-level dataset (50,000+ rows), you can pass `?q=...&ward=...&page=...` query parameters to `/api/voters` so filtering and pagination execute on the Node.js server before returning only the current page of 10 cards.

---

## 8. Troubleshooting Common Errors

| Error Code Displayed on Website | Cause | How to Fix |
| :--- | :--- | :--- |
| `MISSING_SHEET_ID` | `GOOGLE_SHEET_ID` is empty or still set to `YOUR_GOOGLE_SHEET_ID_HERE` in `.env`. | Copy the ID string between `/d/` and `/edit` from your Google Sheet URL into `.env`. |
| `MISSING_GOOGLE_CREDENTIALS` | Service account email/private key or JSON path is missing in `.env`. | Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` & `GOOGLE_PRIVATE_KEY` (or `GOOGLE_APPLICATION_CREDENTIALS_PATH`) in `.env`. |
| `GOOGLE_SHEETS_ACCESS_DENIED` (403) | The Google Sheet hasn't been shared with the Service Account, or Google Sheets API is disabled. | Click **Share** in your Google Sheet and add your Service Account email as a **Viewer**. Enable Google Sheets API in Google Cloud Console. |
| `SPREADSHEET_NOT_FOUND` (404) | The `GOOGLE_SHEET_ID` is incorrect. | Double-check that you copied only the ID string and not `/edit#gid=0`. |
| `INVALID_TAB_NAME` (400) | `GOOGLE_SHEET_TAB_NAME` does not match the worksheet tab at the bottom of your Google Sheet. | Check the exact tab name (including spaces/capitalization) and update `GOOGLE_SHEET_TAB_NAME` in `.env`. |
| `INVALID_COLUMN_HEADERS` (422) | Row 1 of the sheet is missing required column headers (`Ward Number`, `Serial Number`, and `Name`). | Ensure Row 1 contains your column headers, or add your custom header names to `backend/columnMapping.js`. |
| `INVALID_CSV_RESPONSE_HTML` | A regular Google Sheet URL was pasted into `GOOGLE_SHEET_PUBLIC_CSV_URL`. | Switch `GOOGLE_SHEETS_MODE` to `GOOGLE_SHEETS_API` (recommended) or use a valid published CSV link. |

---

## 9. Building & Deploying to Production

Because this application uses a backend to keep your Google Service Account credentials private, deploy it as a **Node.js Web Service** (for example on Render, Railway, Fly.io, DigitalOcean App Platform, or a VPS) rather than a frontend-only static host:

1. **Build Command:**
   ```bash
   npm install && npm run build
   ```
   *(This compiles the React frontend into the `dist/` folder.)*
2. **Start Command:**
   ```bash
   npm start
   ```
   *(This runs `node backend/server.js`, which serves both `/api/voters` and the compiled React frontend from `dist/` on `PORT`.)*
3. **Environment Variables on Hosting Provider:**
   In your hosting dashboard's "Environment Variables" settings, add:
   - `GOOGLE_SHEETS_MODE` = `GOOGLE_SHEETS_API`
   - `GOOGLE_SHEET_ID` = *(your real sheet ID)*
   - `GOOGLE_SHEET_TAB_NAME` = *(your sheet tab name)*
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = *(your service account email)*
   - `GOOGLE_PRIVATE_KEY` = *(your private key)*
   - `ALLOW_VOTER_ID_DISPLAY` = `false` (or `true` if authorized)
# gram-panchayat-electoral-roll-search
