# Boulder Happy Hours - Improvement Tracker

## High Priority

- [x] **Route frontend through API proxy** — Frontend now fetches `/api/deals` instead of the raw Google Sheets URL. Sheet ID is no longer exposed in client-side code.
- [x] **Add caching to API proxy** — Added `Cache-Control: s-maxage=300, stale-while-revalidate=60` to `/api/deals.mjs`. Vercel's edge cache will serve cached responses for 5 minutes, and serve stale data for up to 60s while revalidating in the background.
- [x] **Split monolithic HTML file** — Split into `js/constants.js`, `js/csvParser.js`, `js/features.js`, `js/filters.js`, and `js/app.js`. `index.html` is now a 69-line shell.

## Medium Priority

- [x] **Replace `React.createElement` with HTM** — Converted all `React.createElement` calls in `app.js` to HTM tagged templates (`html\`...\``). Also extracted helper functions (`scrollToDeals`, `getCardHeaderClass`, `getNeighborhood`) and shared class builders (`dayBtnClass`, `dealTypeBtnClass`, etc.).
- [x] **Eliminate code duplication** — Starfield styles extracted to `STARFIELD_ACTIVE_STYLE`/`STARFIELD_INACTIVE_STYLE` constants (was 6 copies). `getStartTime()` deduplicated to single function in `filters.js` (was 3 copies). `groupByVenue()` deduplicated (was 2 identical branches). `getTierStyles()` extracted to `features.js`.
- [x] **Harden CSV parser** — Parser now reads the header row and builds a column-name-to-index map. Fields are looked up by name, not position. Escaped quotes (`""`) are now handled correctly. Adding/reordering columns in the sheet no longer breaks the app.
- [x] **Add `vercel.json`** — Added deployment config with: image caching (7-day edge, 1-day browser), JS file caching (1-day edge with stale-while-revalidate), and security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).

## Low Priority

- [ ] **Add error retry logic** — Failed fetches show a static error message with no recovery option. Add a retry button and optional auto-retry.
- [ ] **Remove stale backup HTML files** — Three dated backup files (`index-boulderhh-06JAN2026.html`, etc.) clutter the repo. Git provides version history already.
- [ ] **Fix missing `/advertise.html`** — Ad card links to `/advertise.html` which doesn't exist in the repo (404).
- [ ] **Expand `.gitignore`** — Currently only ignores `.DS_Store`. Add `node_modules/`, `.vercel/`, `.env`, etc.
- [x] **Remove production `console.log` statements** — Removed debug logging from `csvParser.js` (margarita debug log, total deals log, all deals dump).
