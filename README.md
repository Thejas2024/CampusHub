# CampusHub — screenshot-based student portal prototype

This project follows the supplied reference screenshots:
- Public landing page: white background, orange highlights, two-column hero and metrics.
- Student dashboard: compact top navigation, welcome row, career cards and LMS panel.
- Login page: split layout, illustration panel on the left and orange-topped sign-in card on the right.
- Uses the uploaded TejTech logo for branding.

## Run (Windows PowerShell)
```powershell
npm install
npm run dev
```
Open the localhost URL printed by Vite.

## Run the backend
In a second PowerShell terminal:
```powershell
Set-Location src\server
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm start
```
Set the MySQL connection and `JWT_SECRET` values in `src/server/.env`. To
provision an administrator, set `ADMIN_USERNAME` and a 12–128 character
`ADMIN_PASSWORD` there, then run `npm run create-admin` from `src/server` once.
This creates the `admin_users` table if needed and stores a bcrypt password
hash. The MySQL database must also contain the student `users` table with `id`,
nullable `name`, unique `email`, and `password_hash` columns. The API listens on
port `5000` by default; `/api/health` checks its database connection. Run your
`job_openings` table SQL in the configured `campushub` database. The Careers
page lists published rows from that table, while `/admin/jobs` shows all rows
and their application counts. Applications are stored in a `job_applications`
table that the backend creates on the first successful submission; each
submission also increments `job_openings.applications`.

### Configure Code Practice
The Code Practice page uses Monaco Editor and runs C++17, Java, Python 3, and
JavaScript submissions through a Judge0-compatible service. Set
`JUDGE0_API_URL` in `src/server/.env` to the service base URL. For a RapidAPI
subscription, also set `JUDGE0_API_KEY` and `JUDGE0_API_HOST` there. For a
self-hosted Judge0 instance, use its base URL and leave the key/host blank.
The backend environment template is `src/server/.env.example`.
Never put Judge0 credentials in a `VITE_` variable; the Express server keeps
them out of browser code. Restart the backend after changing the configuration.
Code Practice includes 30 questions (10 per difficulty), sample runs, full
test submissions, and standard-library autocomplete. The runner limits each IP
to 20 runs per minute.

## Build
```powershell
npm run build
```

## Structure
`src/components` contains reusable navigation, cards and layout pieces.
`src/pages` contains individual routed pages.
`src/data/demoData.js` contains clearly-labelled prototype data.
`src/context/ThemeContext.jsx` provides theme switching.
`src/firebase.js` is a safe optional Firebase initialization point.

## Notes
Login and registration use the local Express/MySQL backend. Firebase variables
are placeholders; add your own Firebase project credentials before enabling
Firebase authentication or Firestore. Some dashboard sections still use
prototype data.
