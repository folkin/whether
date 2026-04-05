// App Shell & Orchestrator (Piece 12)
// Entry point. Boots theme, injects HTML shell, wires all UI interactions,
// owns the top-level state machine (loadWeather).

import { initTheme, toggleTheme, getResolvedTheme } from './theme.js'
import { getLocation, setUnits, getUnits, getActiveTab, setActiveTab, getCachedWeather, setCachedWeather } from './storage.js'
import { requestLocation } from './geo.js'
import { getWeather } from './weather.js'
import { initCurrentSection } from './current.js'
import { initDailySection } from './daily.js'
import { initRadar } from './radar/index.js'
import { formatRelativeTime, formatDate } from './units.js'

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** @type {import('./weather.js').WeatherPayload | null} */
let lastData = null

/** @type {ReturnType<typeof initCurrentSection> | null} */
let currentSection = null

/** @type {ReturnType<typeof initDailySection> | null} */
let dailySection = null

/** @type {{ open(): Promise<void>, close(): void, destroy(): void } | null} */
let radar = null

// ---------------------------------------------------------------------------
// Header helpers
// ---------------------------------------------------------------------------

function updateHeaderCity() {
  const loc = getLocation()
  const el = document.getElementById('header-city')
  if (!el) return
  if (!loc) {
    el.textContent = '—'
    return
  }
  const latDir = loc.lat >= 0 ? 'N' : 'S'
  const lonDir = loc.lon >= 0 ? 'E' : 'W'
  el.textContent = `${Math.abs(loc.lat).toFixed(2)}°${latDir} ${Math.abs(loc.lon).toFixed(2)}°${lonDir}`
}

function updateUnitsButton() {
  const btn = document.getElementById('units-toggle')
  if (!btn) return
  const units = getUnits()
  btn.textContent = units === 'metric' ? '°C' : '°F'
}

// ---------------------------------------------------------------------------
// Offline banner
// ---------------------------------------------------------------------------

function showOfflineBanner(fetchedAt) {
  const container = document.getElementById('offline-banner-container')
  if (!container) return
  const time = formatRelativeTime(fetchedAt)
  container.innerHTML = `
    <div class="offline-banner">
      <div class="dot"></div>
      <span><strong>Offline</strong> — Last updated ${time}</span>
    </div>
  `
}

function clearOfflineBanner() {
  const container = document.getElementById('offline-banner-container')
  if (container) container.innerHTML = ''
}

// ---------------------------------------------------------------------------
// Location prompt
// ---------------------------------------------------------------------------

function showLocationPrompt() {
  if (!currentSection) return
  const el = document.getElementById('current-section')
  if (!el) return
  el.innerHTML = `
    <div class="location-prompt">
      <p>No location set.</p>
      <button class="locate-btn-primary" id="prompt-locate-btn">Use My Location</button>
    </div>
  `
  document.getElementById('prompt-locate-btn').addEventListener('click', () => {
    triggerLocate()
  })

  // Hide daily section when no location
  const dailyEl = document.getElementById('daily-section')
  if (dailyEl) dailyEl.innerHTML = ''
}

// ---------------------------------------------------------------------------
// State machine — loadWeather
// ---------------------------------------------------------------------------

async function loadWeather() {
  if (!currentSection || !dailySection) return

  // 1. Read location
  const loc = getLocation()

  // 3. No location: show prompt
  if (!loc) {
    showLocationPrompt()
    return
  }

  // 4. Read units
  const units = getUnits()

  // 5. Try fetching
  try {
    const data = await getWeather(loc.lat, loc.lon, units)

    // 5a. Success
    setCachedWeather(data)
    lastData = data
    clearOfflineBanner()
    currentSection.render(data.current, units)
    dailySection.render(data.daily, data.hourly, units)
  } catch (err) {
    // 5b. Offline path
    if (!navigator.onLine) {
      const cached = getCachedWeather()
      if (cached) {
        lastData = cached.data
        showOfflineBanner(cached.fetchedAt)
        currentSection.render(cached.data.current, units)
        dailySection.render(cached.data.daily, cached.data.hourly, units)
      } else {
        const msg = 'No data — connect to load weather'
        currentSection.showError(msg, loadWeather)
        dailySection.showError(msg, loadWeather)
      }
    } else {
      // 5c. Online error
      const msg = err?.message ?? 'Failed to load weather'
      currentSection.showError(msg, loadWeather)
      dailySection.showError(msg, loadWeather)
    }
  }
}

// ---------------------------------------------------------------------------
// Tab switching
// ---------------------------------------------------------------------------

function activateTab(tab) {
  setActiveTab(tab)

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab)
  })

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tab}`)
  })

  if (radar) {
    if (tab === 'radar') {
      radar.open()
    } else {
      radar.close()
    }
  }
}

// ---------------------------------------------------------------------------
// Location button
// ---------------------------------------------------------------------------

function triggerLocate() {
  const locateBtn = document.getElementById('locate-btn')
  const promptBtn = document.getElementById('prompt-locate-btn')

  if (locateBtn) {
    locateBtn.disabled = true
    locateBtn.setAttribute('aria-label', 'Locating…')
    locateBtn.style.opacity = '0.5'
  }
  if (promptBtn) {
    promptBtn.disabled = true
    promptBtn.textContent = 'Locating…'
  }

  requestLocation().catch(() => {
    // Error is handled by the geo:locationError event listener below
  })
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

// 1. Init theme first (before HTML injection so tokens are ready)
initTheme()

// 2. Inject HTML shell
const todayFormatted = formatDate(new Date().toISOString().slice(0, 10))

const appEl = document.querySelector('#app')
appEl.innerHTML = `
  <div class="app">
    <header class="header">
      <div class="header-location">
        <span class="header-date" id="header-date">${todayFormatted}</span>
        <span class="header-city" id="header-city">—</span>
      </div>
      <div class="header-actions">
        <button class="units-toggle" id="units-toggle" aria-label="Toggle units">°C</button>
        <button class="locate-btn" id="locate-btn" aria-label="Update location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </button>
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sun" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-moon" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </header>

    <nav class="tab-nav">
      <button class="tab-btn" data-tab="weather">Weather</button>
      <button class="tab-btn" data-tab="radar">Radar</button>
    </nav>

    <div class="tab-panel" id="panel-weather">
      <div id="offline-banner-container"></div>
      <div id="current-section"></div>
      <div id="daily-section"></div>
    </div>

    <div class="tab-panel" id="panel-radar">
      <div id="radar-container" style="width:100%;height:100%;"></div>
    </div>
  </div>
`

// 3. Initialise section controllers (they hold refs to their DOM nodes)
currentSection = initCurrentSection(document.getElementById('current-section'))
dailySection = initDailySection(document.getElementById('daily-section'))

// 4. Sync header & unit button from stored state
updateHeaderCity()
updateUnitsButton()

// 5. Wire theme toggle
document.getElementById('theme-toggle').addEventListener('click', toggleTheme)

// 6. Wire units toggle
document.getElementById('units-toggle').addEventListener('click', () => {
  const current = getUnits()
  const next = current === 'metric' ? 'imperial' : 'metric'
  setUnits(next)
  updateUnitsButton()

  // Re-render from lastData without re-fetching
  if (lastData) {
    currentSection.render(lastData.current, next)
    dailySection.render(lastData.daily, lastData.hourly, next)
  }
})

// 7. Wire locate button
document.getElementById('locate-btn').addEventListener('click', triggerLocate)

// 8. Wire tab buttons
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab))
})

// 9. Wire geo events (once at boot, not on each click)
window.addEventListener('geo:locationUpdated', () => {
  const locateBtn = document.getElementById('locate-btn')
  if (locateBtn) {
    locateBtn.disabled = false
    locateBtn.style.opacity = ''
    locateBtn.setAttribute('aria-label', 'Update location')
  }
  updateHeaderCity()
  loadWeather()
})

window.addEventListener('geo:locationError', (e) => {
  const locateBtn = document.getElementById('locate-btn')
  if (locateBtn) {
    locateBtn.disabled = false
    locateBtn.style.opacity = ''
    locateBtn.setAttribute('aria-label', 'Update location')
  }

  const code = e.detail?.code
  const msg = code === 1
    ? 'Location permission denied. Check your browser settings and try again.'
    : code === 2
      ? 'Location unavailable. Try again or check your connection.'
      : 'Location request timed out. Try again.'

  const container = document.getElementById('offline-banner-container')
  if (container) {
    container.innerHTML = `
      <div class="offline-banner">
        <div class="dot" style="background:var(--vscode-charts-red)"></div>
        <span>${msg}</span>
      </div>
    `
    setTimeout(() => { if (container) container.innerHTML = '' }, 6000)
  }
})

// 10. Init radar, then load weather, then restore active tab
;(async () => {
  radar = await initRadar(document.getElementById('radar-container'))

  loadWeather()

  activateTab(getActiveTab())
})()
