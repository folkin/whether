// App Shell & Orchestrator (Piece 12)
// Entry point. Boots theme, renders tab nav (Weather | Radar), wires both tabs.
// Weather tab renders current conditions + 7-day forecast.
// Radar tab is a stub for this build.

import { initTheme, toggleTheme } from './theme.js'
import { getActiveTab, setActiveTab } from './storage.js'
import { initCurrentSection } from './current.js'
import { initDailySection } from './daily.js'
import { formatDate } from './units.js'

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const STATIC_UNITS = 'imperial'

const STATIC_CURRENT = {
  temp: 64.5,
  feelsLike: 64.4,
  humidity: 80,
  windSpeed: 6.6,
  windDir: 10,
  uvIndex: 1.75,
  visibility: 16093,
  weatherCode: 3,
  isDay: true,
  time: '2026-04-04T09:00',
}

const STATIC_DAILY = [
  { date: '2026-04-04', tempMin: 43.0, tempMax: 73.8, precipSum: 0.0,   precipProbMax: 7,  weatherCode: 3,  sunrise: '2026-04-04T06:30', sunset: '2026-04-04T19:45' },
  { date: '2026-04-05', tempMin: 42.2, tempMax: 70.8, precipSum: 0.154, precipProbMax: 76, weatherCode: 63, sunrise: '2026-04-05T06:28', sunset: '2026-04-05T19:46' },
  { date: '2026-04-06', tempMin: 40.7, tempMax: 56.9, precipSum: 0.0,   precipProbMax: 10, weatherCode: 3,  sunrise: '2026-04-06T06:27', sunset: '2026-04-06T19:48' },
  { date: '2026-04-07', tempMin: 33.8, tempMax: 51.5, precipSum: 0.0,   precipProbMax: 12, weatherCode: 3,  sunrise: '2026-04-07T06:25', sunset: '2026-04-07T19:49' },
  { date: '2026-04-08', tempMin: 32.2, tempMax: 44.1, precipSum: 0.0,   precipProbMax: 1,  weatherCode: 0,  sunrise: '2026-04-08T06:23', sunset: '2026-04-08T19:50' },
  { date: '2026-04-09', tempMin: 40.1, tempMax: 56.7, precipSum: 0.0,   precipProbMax: 4,  weatherCode: 3,  sunrise: '2026-04-09T06:22', sunset: '2026-04-09T19:51' },
  { date: '2026-04-10', tempMin: 44.5, tempMax: 58.8, precipSum: 0.0,   precipProbMax: 6,  weatherCode: 3,  sunrise: '2026-04-10T06:20', sunset: '2026-04-10T19:53' },
]

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
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

initTheme()

const todayFormatted = formatDate(new Date().toISOString().slice(0, 10))

const appEl = document.querySelector('#app')

appEl.innerHTML = `
  <div class="app">
    <header class="header">
      <div class="header-location">
        <span class="header-city">New York, NY</span>
        <span class="header-date">${todayFormatted}</span>
      </div>
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
    </header>

    <nav class="tab-nav">
      <button class="tab-btn" data-tab="weather">Weather</button>
      <button class="tab-btn" data-tab="radar">Radar</button>
    </nav>

    <div class="tab-panel" id="panel-weather">
      <div id="current-section"></div>
      <div id="daily-section"></div>
    </div>

    <div class="tab-panel" id="panel-radar">
      <div class="radar-stub">Radar coming soon</div>
    </div>
  </div>
`

// Wire theme toggle
document.getElementById('theme-toggle').addEventListener('click', toggleTheme)

// Wire tab buttons
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab))
})

// Restore active tab
const initialTab = getActiveTab()
activateTab(initialTab)

// Render weather data
const currentSection = initCurrentSection(document.getElementById('current-section'))
const dailySection = initDailySection(document.getElementById('daily-section'))

currentSection.render(STATIC_CURRENT, STATIC_UNITS)
dailySection.render(STATIC_DAILY, STATIC_UNITS)
