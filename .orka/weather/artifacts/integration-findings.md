---
name: Integration Findings
description: Boundary check results, PWA icon status, and behavioral wiring assessment from cycle 11 integration pass — all clean
type: project
---

# Integration Findings

Cycle 11. All 13 pieces built. No boundary violations found; two minor issues fixed during this pass.

---

## Boundary Checks

**Provider seam — PASS**
`fetchWeather` is imported in exactly one place: `src/weather.js` (the provider, Piece 5). `app.js` imports `getWeather` from `weather.js`, never from `openmeteo.js` directly.

**Leaflet lazy boundary — PASS**
One match in `src/` for `import.*leaflet`: a dynamic `await import(/* @vite-ignore */ LEAFLET_ESM)` at `src/radar/radarLayer.js:24`. No static imports of Leaflet anywhere.

**SW cache names — PASS (fixed)**
`CACHE_NAMES` in `src/config.js` has five keys: `shell`, `weatherData`, `radarManifest`, `radarTiles`, `cartoTiles`. The four runtime-caching entries in `vite.config.js` now directly reference `CACHE_NAMES.*` (imported at the top of the file) rather than hardcoded strings. A rename in `config.js` is now a one-file edit. The `shell` key is unused in `runtimeCaching`, which is correct — Workbox manages the app shell precache under its own generated name.

**State ownership — PASS**
`radar/index.js:17` defines `const FALLBACK_LOCATION = { lat: 39.5, lon: -98.35 }` — a hardcoded constant used as a map center when no location is stored. `open()` always reads `getLocation()` (Storage) first and only falls back to this constant on null. No module-level variable caches user-supplied lat/lon outside `storage.js`.

**Radar manifest SWR duration — PASS**
`vite.config.js`: `maxAgeSeconds: 60 * 2` = 120 seconds. Within the ≤120s requirement.

---

## PWA Icons

Installed `@vite-pwa/assets-generator@1.0.2` as a dev dependency. Created source SVG (`pwa-source.svg` at project root — not served) with a cloud-sun design on `#0069cc` blue at 512×512.

Generated into `public/icons/`:
- `pwa-64x64.png` — 64×64
- `pwa-192x192.png` — 192×192
- `pwa-512x512.png` — 512×512
- `maskable-icon-512x512.png` — 512×512 maskable
- `apple-touch-icon-180x180.png` — 180×180 Apple touch icon
- `favicon.ico` — multi-size ICO

**vite.config.js**: icons array restored with all four entries (64, 192, 512, maskable 512).

**index.html**: apple-touch-icon link uncommented; path updated to `/icons/apple-touch-icon-180x180.png`.

**Build verification**: `npm run build` clean. `dist/manifest.webmanifest` contains all four icon entries. All icon files present in `dist/icons/`.

---

## Behavioral Wiring Assessment (Piece 12 done-when list)

**Fresh load, stored location → fetch + render — WIRED**
`loadWeather()` at boot shows skeletons, reads location from Storage, fetches via `getWeather`, renders both sections.

**Fresh load, no stored location → geolocation prompt — WIRED**
`showLocationPrompt()` called when `getLocation()` returns null. Prompt button wired to `triggerLocate()`.

**Units toggle → re-render without re-fetch — WIRED**
Toggle updates units via `setUnits()`, then re-renders both sections from `lastData` in-memory without calling `getWeather`.

**Location update → re-fetch — WIRED**
`geo:locationUpdated` listener calls `loadWeather()` and `updateHeaderCity()`.

**Offline + cache → stale data + banner — WIRED**
`!navigator.onLine` + `getCachedWeather()` truthy → `showOfflineBanner(cached.fetchedAt)` + renders cached data.

**Offline + no cache → empty state — WIRED**
`!navigator.onLine` + null cache → `showError('No data — connect to load weather', loadWeather)` on both sections.

**Tab switch to Radar → open(); close/reopen idempotent — WIRED**
`activateTab('radar')` calls `radar.open()`. Guard `if (initialized) return` in `radar/index.js` makes subsequent opens no-ops. `close()` hides panel without destroying map state.

**Theme toggle → radar base layer swap — WIRED**
Theme toggle → `toggleTheme()` → `theme:changed` dispatch. Radar module subscribes in `open()` and calls `swapBaseLayer()` on each event. Initial map theme applied via `getResolvedTheme()` at open time — correct even if theme changed before first radar open.

---

## No open issues.

---

# Cycle 12 — UAT Pass + Radar Color Scheme Plumbing

No behavioral regressions found. One feature addition completed during this pass.

## Radar Color Scheme Plumbing

Replaced `createRadarTileLayer` (which returned `L.tileLayer` with a server-side color param the API ignores) with a canvas-based `L.GridLayer` subclass that draws tiles into `<canvas>` elements and applies a pixel-level remap table at render time.

New file: `src/radar/colorSchemes.js` — Universal Blue LUT (128 entries), `buildRemap(srcLut, dstLut)`, `PALETTES` export.

**Pixel audit:** fetched two live RainViewer tiles and checked all 65,536 pixels each. Zero unmatched pixels in both tiles. RainViewer pre-quantizes tiles to the LUT — exact-match lookup is sufficient, no nearest-neighbor fallback needed.

Color select trimmed to single "Default" option. Adding a new palette: add a 128-entry LUT to `PALETTES` in `colorSchemes.js` and an `<option>` to the select in `index.js`.

Production build (`npm run build`) verified: manifest and service worker present, PWA installability confirmed.

## No open issues.
