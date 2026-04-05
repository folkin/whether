---
type: discovery
cycle: 1
---

# Discovery: Privacy-First PWA Weather Dashboard

This artifact closes the knowledge gaps needed to commit to a stack and structure. Each section states what the research found and what it implies for design. Open questions that remain after research are flagged explicitly.

---

## API

### Open-Meteo — confirmed as primary data source

**Base endpoint:** `https://api.open-meteo.com/v1/forecast`

All requests are GET, no API key, native CORS support (direct browser fetches work without a proxy). A single request can return both current conditions and daily forecast.

**Minimal combined request:**
```
?latitude=40.75&longitude=-73.99
&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility
&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,uv_index_max
&forecast_days=7
&timezone=America/New_York
&temperature_unit=fahrenheit
&wind_speed_unit=mph
&precipitation_unit=inch
```

**Response shape (abbreviated):**
```json
{
  "current_units": { "temperature_2m": "°F", "weather_code": "wmo code", ... },
  "current": {
    "time": "2026-04-04T09:00",
    "interval": 900,
    "temperature_2m": 64.5,
    "apparent_temperature": 64.4,
    "relative_humidity_2m": 80,
    "precipitation": 0.0,
    "weather_code": 3,
    "wind_speed_10m": 6.6,
    "wind_direction_10m": 10,
    "uv_index": 1.75
  },
  "daily_units": { "temperature_2m_max": "°F", ... },
  "daily": {
    "time": ["2026-04-04", "2026-04-05", ...],
    "temperature_2m_max": [73.8, 70.8, ...],
    "temperature_2m_min": [43.0, 42.2, ...],
    "precipitation_probability_max": [7, 76, ...],
    "weather_code": [3, 63, ...],
    "uv_index_max": [6.4, 2.55, ...]
  }
}
```

Daily arrays are parallel — `time[i]` corresponds to all other `daily.*[i]`. Units are explicit in every response.

**Rate limits:** 10,000 calls/day, 5,000/hour, 600/minute. Non-commercial free tier. **Attribution required** — CC BY 4.0, credit Open-Meteo somewhere in the UI.

**WMO weather codes** (the full set Open-Meteo returns):

| Code | Condition |
|---|---|
| 0 | Clear sky |
| 1 | Mainly clear |
| 2 | Partly cloudy |
| 3 | Overcast |
| 45, 48 | Fog, rime fog |
| 51, 53, 55 | Drizzle (light → dense) |
| 56, 57 | Freezing drizzle |
| 61, 63, 65 | Rain (slight → heavy) |
| 66, 67 | Freezing rain |
| 71, 73, 75 | Snow (slight → heavy) |
| 77 | Snow grains |
| 80, 81, 82 | Rain showers (slight → violent) |
| 85, 86 | Snow showers |
| 95 | Thunderstorm |
| 96, 99 | Thunderstorm with hail |

### Location — browser Geolocation API

No ZIP code entry, no geocoding step, no bundled dataset. The app uses `navigator.geolocation` to obtain lat/lon directly.

**Flow:**
- First open: prompt for geolocation permission, store the returned `{lat, lon}` in `localStorage`
- Subsequent opens: use the stored coordinates — no permission prompt, no re-fetch
- "Update Location" button: re-requests geolocation and overwrites `localStorage` — for when the user is traveling or wants a fresh fix

`navigator.geolocation` is imprecise on desktop (IP-based fallback) but good enough for weather. The user is aware and can re-trigger on demand.

**No geocoding API needed.** Open-Meteo takes lat/lon directly.

### Other APIs considered

**NWS / api.weather.gov:** US-only, no key, public domain, but returns narrative text GeoJSON rather than clean numeric arrays. Two-step lookup (grid point → forecast URL). CORS unreliable. UV and precipitation probability not cleanly surfaced. Not recommended over Open-Meteo for this use case.

No other no-key, no-tracking weather API stands out. Open-Meteo is the clear choice.

### API decisions — confirmed

- **Primary weather API:** Open-Meteo
- **Location:** Browser Geolocation API — lat/lon stored in `localStorage`, re-requestable on demand
- **All API calls are direct browser fetches** — no backend proxy needed

---

## Icons

### Lucide coverage

Lucide has solid coverage for the common weather conditions. Confirmed icons (exact names):

| Condition | Lucide Icon |
|---|---|
| Clear sky (day) | `sun` |
| Clear sky (night) | `moon-star` |
| Partly cloudy (day) | `cloud-sun` |
| Partly cloudy (night) | `cloud-moon` |
| Overcast | `cloudy` |
| Fog | `cloud-fog` |
| Drizzle | `cloud-drizzle` |
| Rain | `cloud-rain` |
| Rain + wind | `cloud-rain-wind` |
| Rain showers (day) | `cloud-sun-rain` |
| Rain showers (night) | `cloud-moon-rain` |
| Snow | `cloud-snow` |
| Hail | `cloud-hail` |
| Thunderstorm | `cloud-lightning` |
| Snowflake | `snowflake` |
| Wind | `wind` |
| Thermometer | `thermometer` |
| Humidity | `droplets` |
| Visibility | `eye` |
| Umbrella | `umbrella` |

**WMO code mapping quality:** Lucide covers ~75% of WMO codes adequately. Gaps cluster around: freezing precipitation (codes 56, 57, 66, 67), thunderstorm with hail (96, 99), and nighttime snow showers (85–86 night). There is no UV index icon.

### Recommended approach

Use Lucide as the primary set, inlined as raw SVG strings (no CDN dependency). Author **4–6 custom SVGs** in Lucide's stroke style (`stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`) for the genuine gaps:

- `cloud-lightning-hail` (WMO 96/99)
- `cloud-moon-snow` (WMO 85–86 night)
- `cloud-freezing-rain` (WMO 56/57/66/67)
- `uv-sun` (UV index indicator)

Meteocons (MIT license) is available if animated icons become a goal — cherry-pick individual SVG files. Not recommended for the MVP; the visual style (illustrated/filled) conflicts with Lucide's minimal line aesthetic.

### Icon decisions — confirmed

- **Icon library:** Lucide, inlined as local SVG
- **Gaps:** 4–6 custom SVGs authored in Lucide's stroke style
- **No CDN dependency**

---

## Radar

Radar is a later feature, but the architecture should not foreclose it.

### RainViewer tile API

- **Manifest endpoint:** `GET https://api.rainviewer.com/public/weather-maps.json`
- Returns `radar.past` (~12 frames, 10-min intervals, last ~2 hours) and `radar.nowcast` (~3 forecast frames)
- **Tile URL:** `{host}{path}/{size}/{z}/{x}/{y}/{color}/{options}.png` — standard XYZ slippy tiles
- **No API key required.** Attribution required: "Rain radar data by RainViewer"
- Global coverage, dense over North America and Europe

### Approach: Leaflet + RainViewer (recommended)

Leaflet (~42 KB gzipped JS + 5 KB CSS) handles projection, pan, pinch-to-zoom, and tile management. The interaction layer on mobile (momentum pan, fractional zoom) is weeks of work to implement correctly from scratch in canvas — Leaflet solves it out of the box.

Base map: **CartoDB Positron or Dark Matter** — free, no API key, attribution required. Muted background lets radar colors read clearly.

Animation: step through frame layers, one `TileLayer` per timestamp, toggle opacity.

**Canvas approach verdict:** Not recommended as starting point. Projection math is simple (~30 lines), but mobile interaction quality requires significant engineering effort. Only worth pursuing if custom rendering (WebGL effects, fully offline tile storage) becomes a requirement.

### Architectural implications

- Radar tile URLs are timestamp-bound — tiles expire after ~2 hours. The manifest must be fetched at demand time (when the user opens radar), not pre-cached at install.
- Tiles themselves are immutable (content-addressed by timestamp) — cache aggressively.
- Service worker caching strategy:
  - **Manifest:** stale-while-revalidate (serve immediately, revalidate in background)
  - **Tiles:** cache-first (immutable by timestamp)
  - **Do not** pre-cache radar tiles at install (timestamps unknown, tiles expire)

### Clean module boundary

Isolate Leaflet behind a thin module boundary so replacing it later is a contained refactor:

```
radar/
  manifest.js    — fetch/cache manifest, expose getFrames()  [no Leaflet]
  animator.js    — step through frames, own the loop         [no Leaflet]
  radarLayer.js  — wraps Leaflet TileLayer, builds tile URLs [Leaflet coupled here]
```

`manifest.js` and `animator.js` survive a renderer change unchanged.

### Radar decisions — confirmed

- **Tile source:** RainViewer (free, no key, global)
- **Renderer:** Leaflet
- **Base map:** CartoDB Positron (no key)
- **Leaflet is a deferred dependency** — only loaded when radar feature is opened

---

## PWA

### What makes it installable

**Chrome/Android requires:**
- `name` or `short_name` in manifest
- At least one icon ≥ 192×192 PNG
- `start_url` and `scope`
- `display: standalone` (or `fullscreen`/`minimal-ui`)
- Registered service worker **with a `fetch` event handler** (registration alone is not enough)
- HTTPS

**iOS requires separate meta tags** (Safari largely ignores the manifest pre-iOS 16.4):
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Weather">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

`viewport-fit=cover` is required for safe area insets to work. `black-translucent` status bar means the app fills the full screen — CSS `env(safe-area-inset-top)` padding is required to avoid content being obscured on notched iPhones.

### Minimal manifest

```json
{
  "name": "Weather",
  "short_name": "Weather",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Icon set: `icon-192.png` (Android prompt), `icon-512.png` (Android splash), `icon-512-maskable.png` (adaptive icons, inner 80% safe zone), `apple-touch-icon.png` 180×180 (iOS).

### Caching strategy

| Resource | Strategy | Notes |
|---|---|---|
| HTML, CSS, JS, icons | Cache-first | Pre-cached at install |
| Open-Meteo API responses | Network-first, stale fallback | Serve cached if offline |
| Census ZCTA dataset | Cache-first, long TTL | Pre-cached at install; coordinates don't change |
| Geocoding API response | Cache-first, long TTL | Cached after first ZIP lookup |
| Radar manifest | Stale-while-revalidate | Timestamps expire; don't serve stale > 10 min |
| Radar tiles | Cache-first | Immutable by timestamp |

**Open-Meteo CORS gotcha:** Open-Meteo responses may include `Cache-Control: no-cache`, but the SW's `cache.put()` bypasses HTTP cache directives — it stores directly in Cache Storage regardless. Manual TTL tracking is needed (store a `fetchedAt` timestamp alongside cached responses).

### Offline UX

Show last-loaded data with a staleness indicator ("Last updated 4 hours ago — you're offline"). Four states:

| State | Display |
|---|---|
| Online, fresh | Normal UI |
| Online, API failed | Error banner + last cached data if available |
| Offline, cached data | Stale banner with human-readable age |
| Offline, no cache | "No data available — connect to load weather" |

Use `localStorage` as a secondary cache with `fetchedAt` timestamp — gives the main thread direct staleness access without SW message-passing. Also survives iOS aggressive SW cache eviction (iOS can wipe SW caches after ~7 days of non-use; `localStorage` persists longer).

**iOS-specific:** No `beforeinstallprompt` event. Detect iOS + not-in-standalone-mode and show a manual "Tap Share → Add to Home Screen" banner.

```js
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (isIos && !window.navigator.standalone) {
  showInstallBanner();
}
```

### Deployment

The app is entirely client-side — static HTML, CSS, and JS. No backend required. Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or a self-hosted nginx/Caddy. HTTPS is required for PWA installability — all of the above provide it for free.

---

## Build Tooling

**Output:** Single `index.html`, single `app.js`, single `style.css` (or CSS embedded in HTML — TBD at prototype stage). No framework, no runtime dependencies beyond the deferred Leaflet load for radar.

A minimal bundler is needed to: concatenate JS modules, produce a service worker, and generate PWA icons from SVG. Options:

- **esbuild** — zero-config JS bundler, extremely fast, handles ESM → single bundle. No plugin ecosystem needed for this scope.
- **Vite** — wraps esbuild, adds dev server with HMR, PWA plugin available. More convenient for development but slightly more setup than raw esbuild.

Either works. The build artifact is static files only — no server-side code emitted.

**App icon:** Generate from a Lucide weather SVG (e.g., `cloud-sun` or `sun`) at build time or as a one-time step. SVG → PNG at 192×192, 512×512, and 180×180 (apple-touch-icon). Tools: `sharp`, `svgexport`, or Inkscape CLI. The specific Lucide icon to use is a UX choice — surface in prototype.

---

## Theming

Light and dark themes, derived from the user's VS Code color themes (`vs-code-dark.jsonc` and `vs-code-light.jsonc` at `/home/human/code/personal/orka/orka/`). CSS custom properties, toggled via `prefers-color-scheme` media query + optional manual override.

**Dark theme tokens** (from `vs-code-dark.jsonc`):

| Token | Value | Use |
|---|---|---|
| `--bg` | `#121314` | Page background |
| `--surface` | `#191a1b` | Cards, panels |
| `--border` | `#2a2b2c` | Dividers, outlines |
| `--fg` | `#bfbfbf` | Primary text |
| `--fg-muted` | `#8c8c8c` | Secondary text, labels |
| `--accent` | `#3994bc` | Interactive elements, links |
| `--chart-blue` | `#57a3f8` | |
| `--chart-green` | `#86cf86` | |
| `--chart-orange` | `#cd861a` | |
| `--chart-red` | `#ef8773` | |
| `--chart-yellow` | `#e0b97f` | |

**Light theme tokens** (from `vs-code-light.jsonc`):

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page background |
| `--surface` | `#fafafd` | Cards, panels |
| `--border` | `#f0f1f2` | Dividers, outlines |
| `--fg` | `#202020` | Primary text |
| `--fg-muted` | `#606060` | Secondary text, labels |
| `--accent` | `#0069cc` | Interactive elements, links |
| `--chart-blue` | `#1a5cff` | |
| `--chart-green` | `#388a34` | |
| `--chart-orange` | `#d18616` | |
| `--chart-red` | `#ad0707` | |
| `--chart-yellow` | `#667309` | |

Implementation: `@media (prefers-color-scheme: dark)` sets dark tokens by default; a `data-theme` attribute on `<html>` allows manual override. Lucide icons inherit `currentColor` automatically.

---

## Stack Summary — What's Now Confirmed

| Decision | Choice | Status |
|---|---|---|
| Language | Vanilla JS (no framework) | Confirmed |
| Weather API | Open-Meteo | Confirmed — no key, CORS-native, clean numeric arrays |
| Location | Browser Geolocation API, lat/lon in `localStorage`, on-demand update | Confirmed |
| Data refresh | On-demand (user-triggered), no real-time | Confirmed |
| Icon library | Lucide (local SVGs) + 4–6 custom gap SVGs | Confirmed |
| App icon | Lucide weather SVG → PNG (192, 512, 180) | Confirmed |
| Radar tiles | RainViewer (deferred feature) | Confirmed |
| Radar renderer | Leaflet (deferred, loaded on demand) | Confirmed |
| Base map | CartoDB Positron (no key) | Confirmed |
| PWA display | `standalone` | Confirmed |
| PWA caching | Cache-first shell, network-first data, stale fallback | Confirmed |
| Build output | Single HTML + single JS + single CSS | Confirmed |
| Build tool | esbuild or Vite (TBD) | To confirm |
| Themes | Light + dark via CSS custom properties from VS Code theme files | Confirmed |
| Deployment | Static files, any HTTPS host | Confirmed — fully client-side |
| Tracking | None | Confirmed |

## Open Questions

- **Build tool:** esbuild vs Vite — minor decision, can be resolved at decomposition.
- **Icon color treatment:** Lucide icons are monochrome via `currentColor`. Whether weather icons get condition-based accent colors (yellow sun, blue rain) is a UX choice to surface in prototype.
- **App icon:** Which Lucide icon to use for the PWA home screen icon — surface in prototype.
