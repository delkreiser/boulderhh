# Boulder Happy Hours - Improvement Tracker

## High Priority

- [x] **Route frontend through API proxy** — Frontend now fetches `/api/deals` instead of the raw Google Sheets URL. Sheet ID is no longer exposed in client-side code.
- [x] **Add caching to API proxy** — Added `Cache-Control: s-maxage=300, stale-while-revalidate=60` to `/api/deals.mjs`. Vercel's edge cache will serve cached responses for 5 minutes, and serve stale data for up to 60s while revalidating in the background.
- [x] **Split monolithic HTML file** — Split into `js/constants.js`, `js/csvParser.js`, `js/features.js`, `js/filters.js`, and `js/app.js`. `index.html` is now a 69-line shell.

## Medium Priority

- [ ] **Replace `React.createElement` with HTM** — Use the `htm` library for JSX-like syntax without a build step. Makes the UI code readable and maintainable.
- [x] **Eliminate code duplication** — Starfield styles extracted to `STARFIELD_ACTIVE_STYLE`/`STARFIELD_INACTIVE_STYLE` constants (was 6 copies). `getStartTime()` deduplicated to single function in `filters.js` (was 3 copies). `groupByVenue()` deduplicated (was 2 identical branches). `getTierStyles()` extracted to `features.js`.
- [ ] **Harden CSV parser** — Parser uses positional column indexes (0-23) instead of reading header names. Adding a column to the sheet breaks everything. Also doesn't handle escaped quotes (`""`). Parse the header row for resilient field mapping.
- [ ] **Add `vercel.json`** — No deployment config exists. Add caching headers for static assets, security headers (CSP, X-Frame-Options), and redirect rules.

## Low Priority

- [ ] **Add error retry logic** — Failed fetches show a static error message with no recovery option. Add a retry button and optional auto-retry.
- [ ] **Remove stale backup HTML files** — Three dated backup files (`index-boulderhh-06JAN2026.html`, etc.) clutter the repo. Git provides version history already.
- [ ] **Fix missing `/advertise.html`** — Ad card links to `/advertise.html` which doesn't exist in the repo (404).
- [ ] **Expand `.gitignore`** — Currently only ignores `.DS_Store`. Add `node_modules/`, `.vercel/`, `.env`, etc.
- [x] **Remove production `console.log` statements** — Removed debug logging from `csvParser.js` (margarita debug log, total deals log, all deals dump).
