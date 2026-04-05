---
type: brief
cycle: 1
---

# Project Brief: Weather Dashboard

## What the human wants to build

A minimal, privacy-first PWA weather dashboard. Personal tool. Greenfield — no existing code. The human checks in at milestones but otherwise lets the process run.

## Confirmed scope (post-Discovery)

- **Stack:** Vanilla JS, no framework. Single `index.html`, single `app.js`, single `style.css`. Built with Vite (confirmed).
- **Location:** Browser Geolocation API, one-time prompt on first open. Lat/lon stored in `localStorage`. On-demand "Update Location" button for when traveling.
- **Data:** Open-Meteo API — no key, CORS-native, direct browser fetch. Current conditions + 7-day daily forecast in one request. Load on demand (user-triggered), no background refresh.
- **Privacy:** No tracking, no ads, no third-party analytics. All API calls go directly to Open-Meteo (EU-hosted). No backend.
- **Icons:** Lucide SVGs inlined locally. 4–6 custom gap SVGs in Lucide's stroke style for uncovered WMO codes.
- **Themes:** Light and dark, via CSS custom properties derived from the user's VS Code color theme files. `prefers-color-scheme` default + manual toggle.
- **PWA:** Installable on iOS and Android. `standalone` display mode. Service worker with cache-first shell, network-first weather data, stale fallback for offline.
- **Radar:** In scope. RainViewer tiles + Leaflet, Leaflet loaded on demand when radar panel opens. CartoDB base map. Animation (frame stepping through past ~2 hours). UX details (panel shape, theme integration, controls) to be resolved during decomposition.
- **Deployment:** Static files only, any HTTPS host.

## Out of scope

- Multi-location support
- Real-time / auto-refresh
- ZIP code entry (replaced by geolocation)
- Backend or server-side logic
- Ads, tracking, device fingerprinting
