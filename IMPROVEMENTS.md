# Boulder Happy Hours - Improvement Tracker

## High Priority

- [x] **Route frontend through API proxy** — Frontend now fetches `/api/deals` instead of the raw Google Sheets URL. Sheet ID is no longer exposed in client-side code.
- [x] **Add caching to API proxy** — Added `Cache-Control: s-maxage=300, stale-while-revalidate=60` to `/api/deals.mjs`. Vercel's edge cache will serve cached responses for 5 minutes, and serve stale data for up to 60s while revalidating in the background.
- [ ] **Split monolithic HTML file** — All 1,170 lines (React app, CSV parser, filters, UI) live in one `<script>` block. Split into separate ES module files (`csvParser.js`, `filters.js`, components, etc.).

## Medium Priority

- [ ] **Replace `React.createElement` with HTM** — Use the `htm` library for JSX-like syntax without a build step. Makes the UI code readable and maintainable.
- [ ] **Eliminate code duplication** — The starfield background style is copy-pasted 6 times, `getStartTime()` is defined 3 times, and button groups are duplicated across mobile/desktop/sticky views. Extract shared constants and helpers.
- [ ] **Harden CSV parser** — Parser uses positional column indexes (0-23) instead of reading header names. Adding a column to the sheet breaks everything. Also doesn't handle escaped quotes (`""`). Parse the header row for resilient field mapping.
- [ ] **Add `vercel.json`** — No deployment config exists. Add caching headers for static assets, security headers (CSP, X-Frame-Options), and redirect rules.

## Low Priority

- [ ] **Add error retry logic** — Failed fetches show a static error message with no recovery option. Add a retry button and optional auto-retry.
- [ ] **Remove stale backup HTML files** — Three dated backup files (`index-boulderhh-06JAN2026.html`, etc.) clutter the repo. Git provides version history already.
- [ ] **Fix missing `/advertise.html`** — Ad card links to `/advertise.html` which doesn't exist in the repo (404).
- [ ] **Expand `.gitignore`** — Currently only ignores `.DS_Store`. Add `node_modules/`, `.vercel/`, `.env`, etc.
- [ ] **Remove production `console.log` statements** — CSV parser logs all deals and margarita debug info to the browser console on every load.
