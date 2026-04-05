// Storage (Piece 2)
// Typed wrapper over localStorage. Reads and writes location, theme, units,
// active tab, and cached weather data. Returns typed defaults on missing/corrupt entries.
// Depends on: config.js (STORAGE_KEYS)

import { STORAGE_KEYS } from './config.js'

// --- Location ---

export function getLocation() {
  const raw = localStorage.getItem(STORAGE_KEYS.lat)
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw)
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      !isFinite(parsed.lat) ||
      !isFinite(parsed.lon)
    ) {
      return null
    }
    return { lat: parsed.lat, lon: parsed.lon }
  } catch {
    return null
  }
}

export function setLocation(lat, lon) {
  localStorage.setItem(STORAGE_KEYS.lat, JSON.stringify({ lat, lon }))
}

// --- Theme ---

const VALID_THEMES = ['light', 'dark', 'system']

export function getTheme() {
  const val = localStorage.getItem(STORAGE_KEYS.theme)
  return VALID_THEMES.includes(val) ? val : 'system'
}

export function setTheme(t) {
  localStorage.setItem(STORAGE_KEYS.theme, t)
}

// --- Units ---

const VALID_UNITS = ['metric', 'imperial']

export function getUnits() {
  const val = localStorage.getItem(STORAGE_KEYS.units)
  return VALID_UNITS.includes(val) ? val : 'metric'
}

export function setUnits(u) {
  localStorage.setItem(STORAGE_KEYS.units, u)
}

// --- Active Tab ---

const VALID_TABS = ['weather', 'radar']

export function getActiveTab() {
  const val = localStorage.getItem(STORAGE_KEYS.activeTab)
  return VALID_TABS.includes(val) ? val : 'weather'
}

export function setActiveTab(tab) {
  localStorage.setItem(STORAGE_KEYS.activeTab, tab)
}

// --- Cached Weather ---

export function getCachedWeather() {
  const raw = localStorage.getItem(STORAGE_KEYS.weatherCache)
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || typeof parsed.fetchedAt !== 'number') {
      return null
    }
    return { data: parsed.data, fetchedAt: parsed.fetchedAt }
  } catch {
    return null
  }
}

export function setCachedWeather(data) {
  localStorage.setItem(STORAGE_KEYS.weatherCache, JSON.stringify({ data, fetchedAt: Date.now() }))
}

// --- Radar Color ---

const VALID_RADAR_COLORS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export function getRadarColor() {
  const val = parseInt(localStorage.getItem(STORAGE_KEYS.radarColor), 10)
  return VALID_RADAR_COLORS.includes(val) ? val : 6 // default: NEXRAD Level III
}

export function setRadarColor(color) {
  localStorage.setItem(STORAGE_KEYS.radarColor, String(color))
}
