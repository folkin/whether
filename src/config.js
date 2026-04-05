// Config & Constants (Piece 1)
// Single source of truth for API base URLs, localStorage key names, and cache names.
// No other module should contain bare URL strings or storage key literals.

export const API = {
  openMeteo: {
    base: 'https://api.open-meteo.com/v1/forecast',
  },
  rainViewer: {
    manifest: 'https://api.rainviewer.com/public/weather-maps.json',
  },
  cartoDB: {
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
}

export const STORAGE_KEYS = {
  lat: 'weather:lat',
  lon: 'weather:lon',
  theme: 'weather:theme',
  units: 'weather:units',
  activeTab: 'weather:activeTab',
  weatherCache: 'weather:cache',
  weatherCachedAt: 'weather:cachedAt',
  radarColor: 'weather:radarColor',
}

export const CACHE_NAMES = {
  shell: 'weather-shell-v1',
  weatherData: 'weather-data-v1',
  radarManifest: 'radar-manifest-v1',
  radarTiles: 'radar-tiles-v1',
  cartoTiles: 'carto-tiles-v1',
}
