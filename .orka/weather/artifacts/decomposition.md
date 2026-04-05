---
type: decomposition
cycle: 2
---

# Decomposition Map: Weather PWA

Stack: Vanilla JS · Vite · Open-Meteo · Browser Geolocation · Lucide SVGs + custom gap SVGs · CSS custom properties (VS Code tokens) · vite-plugin-pwa / Workbox · RainViewer + Leaflet · CartoDB base map

Navigation model: 2 tabs — **Weather** (current conditions + 7-day forecast, scrollable) and **Radar** (full-screen map tab). Tab state persisted in localStorage so the active tab is restored on reload.

---

## Pieces

---

### 1. Config & Constants
**Does:** Single source of truth for all static configuration — API base URLs, localStorage key names, cache names, tile URL templates, and numeric thresholds. No other module contains bare URL strings or magic keys.

**Exposes:**
```js
export const API = {
  openMeteo: { base: string },
  rainViewer: { manifest: string },
  cartoDB: { light: string, dark: string }, // Positron, Dark Matter tile URL templates
}
export const STORAGE_KEYS = {
  lat: string, lon: string,
  theme: string, units: string, activeTab: string,
  weatherCache: string, weatherCachedAt: string,
}
export const CACHE_NAMES = {
  shell: string, weatherData: string,
  radarManifest: string, radarTiles: string, cartoTiles: string,
}
```

**Depends on:** Nothing.

**Done when:** All other modules import from here and contain no bare URL strings or storage key literals. Changing an API URL or key name is a one-file edit.

---

### 2. Storage
**Does:** Thin typed wrapper over `localStorage`. Reads and writes location coordinates, theme preference, units preference, active tab, and the weather data cache (data + fetchedAt timestamp). Handles missing keys and parse errors gracefully, returning typed defaults.

**Exposes:**
```js
export function getLocation(): { lat: number, lon: number } | null
export function setLocation(lat: number, lon: number): void
export function getTheme(): 'light' | 'dark' | 'system'
export function setTheme(t: 'light' | 'dark' | 'system'): void
export function getUnits(): 'metric' | 'imperial'
export function setUnits(u: 'metric' | 'imperial'): void
export function getActiveTab(): 'weather' | 'radar'
export function setActiveTab(tab: 'weather' | 'radar'): void
export function getCachedWeather(): { data: WeatherPayload, fetchedAt: number } | null
export function setCachedWeather(data: WeatherPayload): void
```

**Depends on:** Config & Constants (for `STORAGE_KEYS`).

**Done when:** No other module calls `localStorage` directly. `getCachedWeather` returns null (not undefined) on a cold start or corrupt entry.

---

### 3. Geolocation
**Does:** Wraps `navigator.geolocation`. Requests position on demand only (never on load without a user gesture). Writes result to Storage. Dispatches a window event so the App Shell knows coordinates changed.

**Exposes:**
```js
export async function requestLocation(): Promise<{ lat: number, lon: number }>
// Rejects with { code: number, message: string } on denial or timeout.

// Dispatches on window:
'geo:locationUpdated'  // detail: { lat, lon }
'geo:locationError'    // detail: { code, message }
```

**Depends on:** Storage, Config & Constants.

**Done when:** Calling `requestLocation()` updates Storage and fires `geo:locationUpdated`. Denial/timeout fires `geo:locationError` with a usable code. No other module calls `navigator.geolocation`.

---

### 4. Theme
**Does:** Resolves and applies the light/dark theme. Sets `data-theme` on `<html>`. Listens to `prefers-color-scheme` for system mode. Dispatches `theme:changed` so the Radar module can swap its CartoDB tile layer without rebuilding the map.

**Exposes:**
```js
export function initTheme(): void          // call once on app boot
export function toggleTheme(): void
export function getResolvedTheme(): 'light' | 'dark'

// Dispatches on window:
'theme:changed'  // detail: { resolved: 'light' | 'dark' }
```

**Depends on:** Storage, Config & Constants.

**Done when:** `initTheme()` applies the correct `data-theme` before first paint with no flash. `getResolvedTheme()` is synchronously correct at all times. `theme:changed` fires on every resolved-theme transition, including system changes.

---

### 5. Weather Provider
**Does:** Thin seam between the App Shell and the underlying weather data source. The App Shell imports all weather data through this module — never from the Open-Meteo client directly. Swapping the data source requires editing only this file; the App Shell is unaffected.

**Exposes:**
```js
export async function getWeather(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial'
): Promise<WeatherPayload>
// Throws ApiError { status, message } on failure.
```

**Depends on:** Open-Meteo Client.

**Done when:** The App Shell imports `getWeather` from this module, not from the Open-Meteo Client. Open-Meteo Client is an implementation detail invisible above this seam. `WeatherPayload` shape is unchanged. Replacing the data source requires editing only this file and Piece 6.

---

### 6. Open-Meteo Client
**Does:** Fetches current conditions and 7-day daily forecast from Open-Meteo. Assembles the URL from Config, executes the fetch, and returns a normalized `WeatherPayload`. Does not cache, does not render.

**Exposes:**
```js
export async function fetchWeather(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial'
): Promise<WeatherPayload>

// WeatherPayload:
{
  current: {
    temp: number, feelsLike: number, humidity: number,
    windSpeed: number, windDir: number, uvIndex: number,
    visibility: number, weatherCode: number, isDay: boolean,
    time: string,  // ISO
  },
  daily: Array<{
    date: string, tempMin: number, tempMax: number,
    precipSum: number, precipProbMax: number,
    weatherCode: number,
    sunrise: string, sunset: string,
  }>,
  units: { temp: string, wind: string, precip: string },
}
// Throws ApiError { status, message } on network failure or non-200.
```

**Depends on:** Config & Constants.

**Done when:** Returns a valid `WeatherPayload` for real coords. Throws a typed `ApiError` on failure. Contains no caching or rendering logic.

---

### 7. Icon Resolver
**Does:** Maps WMO weather codes + day/night flag to an inline SVG string with a condition-based accent color applied. Covers all Open-Meteo codes using Lucide icons and the 4–6 custom gap SVGs. Color is set via a VS Code palette token reference on the root `<svg>` element — light/dark adaptation is handled entirely by the existing token system, with no branching in the resolver.

**Exposes:**
```js
export function getWeatherIcon(
  code: number,
  isDay: boolean,
  opts?: { size?: number, className?: string }
): string  // full <svg>...</svg> string with condition accent color applied

export function getWeatherLabel(code: number): string  // e.g. "Heavy rain"
```

**Depends on:** Nothing (SVGs bundled via Vite `?raw` imports at build time).

**Done when:** Every WMO code Open-Meteo returns produces a non-empty SVG with a condition-specific accent color applied via a VS Code palette token reference (`style="color: var(--vscode-charts-*)"`) on the root element — internal strokes use `currentColor` and inherit this. All code-to-token mappings are defined in a single lookup constant within this module. The `isDay` flag determines icon shape (day/night variants) only — it does not affect color selection. No code produces blank or broken output.

---

### 8. Units Formatter
**Does:** Converts raw API numbers into display strings with correct labels. Pure functions, no I/O.

**Exposes:**
```js
export function formatTemp(v: number, units: 'metric' | 'imperial'): string   // "21°C"
export function formatWind(v: number, units: 'metric' | 'imperial'): string   // "18 km/h"
export function formatPrecip(v: number, units: 'metric' | 'imperial'): string // "4.2 mm"
export function formatPercent(v: number): string                               // "73%"
export function formatDate(iso: string): string                                // "Sat Apr 5"
export function formatTime(iso: string): string                                // "3:42 PM"
export function formatRelativeTime(epochMs: number): string                    // "4 hours ago"
```

**Depends on:** Nothing.

**Done when:** All functions are independently unit-testable. Switching units produces a different string for the same raw value.

---

### 9. Current Conditions Renderer
**Does:** Renders the hero section: large temperature, feels-like, weather icon, condition label, humidity, wind, UV index, visibility. Manages its own skeleton and error states. Accepts data slices — reads nothing from Storage or network.

**Exposes:**
```js
export function initCurrentSection(el: HTMLElement): {
  render(data: WeatherPayload['current'], units: 'metric' | 'imperial'): void,
  showSkeleton(): void,
  showError(msg: string, onRetry: () => void): void,
}
```

**Depends on:** Icon Resolver, Units Formatter.

**Done when:** `render()` with valid data shows a complete, styled current conditions section in both themes. `showSkeleton()` shows placeholder shapes at the correct layout dimensions. `showError()` shows a retry-able error state. No fetch or Storage calls inside.

---

### 10. Daily Forecast Renderer
**Does:** Renders the 7-day daily forecast: date, high/low temps, precip probability, weather icon per day. Manages its own skeleton and error states.

**Exposes:**
```js
export function initDailySection(el: HTMLElement): {
  render(data: WeatherPayload['daily'], units: 'metric' | 'imperial'): void,
  showSkeleton(): void,
  showError(msg: string, onRetry: () => void): void,
}
```

**Depends on:** Icon Resolver, Units Formatter.

**Done when:** `render()` produces 7 rows with correct data. Skeleton shows 7 placeholder rows at correct dimensions. No fetch or Storage calls inside.

---

### 11. Radar Module
**Does:** Owns the Radar tab. Lazy-loads Leaflet and the RainViewer manifest only on first `open()` call. Initializes a Leaflet map with the CartoDB tile layer matching the current theme. Loads RainViewer frame timestamps, cycles through them as `TileLayer` instances. Swaps the base tile layer on `theme:changed` without rebuilding the map. Shows a small `CircleMarker` at the user's coordinates (suppressible at prototype review if CartoDB labels make it redundant).

Animation controls: play/pause button + scrubber (progress bar). Scrubbing auto-pauses playback; resuming requires the user to press play. Current frame's approximate timestamp displayed alongside the scrubber ("45 min ago").

**Internal structure (for boundary clarity — not implementation spec):**
```
radar/
  manifest.js   — fetch/cache RainViewer manifest, expose getFrames()  [no Leaflet]
  animator.js   — own the frame loop and scrubber state               [no Leaflet]
  radarLayer.js — wrap Leaflet TileLayer, build tile URLs             [Leaflet here only]
```

**Exposes:**
```js
export async function initRadar(el: HTMLElement): Promise<{
  open(): Promise<void>,   // lazy-loads Leaflet + manifest on first call; no-op thereafter
  close(): void,           // hides panel, keeps map instance alive
  destroy(): void,         // full teardown (page unload)
}>
```

**Depends on:** Config & Constants (tile URL templates, cache names), Storage (lat/lon for initial center), Theme (`getResolvedTheme()` on init, `theme:changed` event for tile layer swap).

**Done when:** Leaflet and RainViewer resources are absent from the network waterfall until `open()` is called the first time. Map renders with the correct CartoDB layer for the active theme. Scrubbing pauses playback. `theme:changed` swaps the base tile layer without rebuilding the map. `close()` then `open()` does not re-initialize the map or re-fetch the manifest.

---

### 12. App Shell & Orchestrator
**Does:** Entry point (`app.js`). Boots the app: initializes Theme, renders tab nav (Weather | Radar), activates the stored active tab. On the Weather tab: reads location from Storage, fetches weather (or serves cache if fresh), renders Current Conditions and Daily Forecast sections. Handles the full state machine: loading → data, loading → error, offline → stale cache, offline → no cache. Wires the "Update Location" button to Geolocation and re-fetches on `geo:locationUpdated`. Re-renders all sections on units change without re-fetching. Initializes Radar module and hands it its container — Radar's internal lifecycle is Radar's problem.

Tab nav: two tabs (`weather` | `radar`). Switching tabs updates Storage and shows/hides the correct container. No routing library — direct DOM class toggling.

**Exposes:** Nothing (side-effectful top-level entry, imported once).

**Depends on:** All modules above. Imports weather data through Weather Provider (Piece 5) — never from Open-Meteo Client directly. This is the only module permitted to import from multiple sibling modules simultaneously.

**Done when:**
- Fresh load with stored location: fetches weather, renders both sections, no layout shift after skeleton resolves.
- Fresh load, no stored location: shows geolocation prompt, then fetches and renders on success.
- Units toggle: re-renders both sections with existing data, no re-fetch.
- Location update: re-fetches, re-renders.
- Offline with cache: renders stale data with "Last updated X ago — you're offline" banner.
- Offline, no cache: shows "No data — connect to load weather" state.
- Tab switch to Radar: calls `radar.open()`, map appears. Switch back and forth does not re-initialize.
- Theme toggle: applies immediately to all sections and radar base layer.

---

### 13. Service Worker (vite-plugin-pwa / Workbox)
**Does:** Implements the caching strategy. Configured via `vite.config.js` Workbox options — not hand-authored fetch handlers except where Workbox recipes don't cover the behavior.

**Contract (behavioral):**

| Resource | Strategy | Notes |
|---|---|---|
| HTML, CSS, JS bundles, local SVGs, icons | Cache-first | Precached at install via Workbox manifest |
| `api.open-meteo.com/*` | Network-first, 10s timeout | Falls back to stale cache on timeout/failure |
| `api.rainviewer.com/public/weather-maps.json` | Stale-while-revalidate | Expire after 2 min (stale manifest has wrong tile timestamps) |
| `tilecache.rainviewer.com/*` | Cache-first | Max 200 entries, expire after 10 min |
| `*.basemaps.cartocdn.com/*` | Cache-first | Max 500 entries, expire after 7 days |

Open-Meteo responses may include `Cache-Control: no-cache` — Workbox's `cache.put()` bypasses HTTP cache directives and stores regardless. The Weather tab's staleness banner reads `fetchedAt` from `localStorage` (written by the App Shell alongside the cache) rather than querying the SW, avoiding message-passing complexity and surviving iOS SW cache eviction.

**Depends on:** Config & Constants (for `CACHE_NAMES` — consumed at build time in `vite.config.js`, not at runtime).

**Done when:** Offline with prior load: app shell and last weather data serve from cache with no network error page. Radar tiles viewed previously serve from cache. Build emits a valid `sw.js` and `manifest.webmanifest`. PWA installability criteria met on Chrome/Android and iOS.

---

## Dependency Order (Build Tiers)

```
Tier 0 — No dependencies (build and test in isolation)
  Config & Constants
  Units Formatter
  Icon Resolver

Tier 1 — Depends on Tier 0 only
  Storage                 ← Config & Constants
  [UI primitives: CSS custom properties, skeleton CSS — no JS module, just style.css]

Tier 2 — Depends on Tiers 0–1
  Geolocation             ← Storage, Config & Constants
  Theme                   ← Storage, Config & Constants
  Open-Meteo Client       ← Config & Constants

Tier 3 — Depends on Tiers 0–2 (provider seam and section renderers, independently buildable)
  Weather Provider              ← Open-Meteo Client
  Current Conditions Renderer   ← Icon Resolver, Units Formatter
  Daily Forecast Renderer       ← Icon Resolver, Units Formatter

Tier 4 — Depends on Tiers 0–3
  Radar Module            ← Config & Constants, Storage, Theme (lazy-loads Leaflet at runtime)

Tier 5 — Integrates everything
  App Shell & Orchestrator  ← all Tier 0–4 modules (weather data via Weather Provider)
  Service Worker config     ← build-time only; no runtime imports
```

---

## Boundary Risks

**Provider seam enforcement:** The App Shell must import weather data through Weather Provider (Piece 5) only. A direct import of `fetchWeather` from Open-Meteo Client anywhere outside Piece 5 defeats the seam — a linter rule or code review check should catch this.

**State ownership:** Lat/lon lives in Storage only. No module caches coordinates in module-level variables — always re-read from Storage at call time. If this breaks, location updates silently stop propagating.

**Leaflet lazy boundary:** Nothing in Tiers 0–4 may statically `import` Leaflet. The only permitted entry point is a dynamic `import()` inside `radarLayer.js`. One accidental static import loads Leaflet on every page view.

**Renderer contract shape:** Current Conditions and Daily Forecast both expose `{ render, showSkeleton, showError }`. The App Shell treats them interchangeably for loading state management. Diverging from this shape forces an App Shell change.

**SW cache names:** `CACHE_NAMES` in Config & Constants feeds both the runtime Storage module (for the weather data key) and `vite.config.js` Workbox configuration. A rename in one place but not the other causes the SW and runtime to operate on different caches silently.

**Radar manifest freshness:** The RainViewer manifest contains timestamp-bound tile paths that expire in ~2 hours. The SW must not serve a manifest older than 2 minutes stale. If the SWR cache duration drifts, the radar will request tiles that no longer exist.
