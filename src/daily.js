// Daily Forecast Renderer (Piece 10)
// Renders the 7-day daily forecast: date, high/low temps, precip probability, weather icon.
// Below the strip, renders the hourly panel for the selected day.
// Manages its own skeleton and error states. Reads nothing from Storage or network.
// Depends on: icons.js, units.js

import { getWeatherIcon } from './icons.js'
import { formatTemp, formatPercent, formatHour, formatWind } from './units.js'

function dayWeekday(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}
function dayMonthDay(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function fmtStripTemp(v, units) {
  return `${Math.round(v)}°<span class="temp-unit">${units === 'imperial' ? 'F' : 'C'}</span>`
}

// Color stops keyed to °F: [temp, hue, sat%, light%]
// Freezing(<20) → cold(40) → temperate(55) → warm(72) → hot(90+)
const TEMP_COLOR_STOPS = [
  [10,  250, 80, 65],
  [30,  210, 75, 55],
  [55,  150, 45, 48],
  [72,   38, 85, 52],
  [90,    8, 80, 52],
]

function tempFeelsColor(feelsLike, units) {
  const f = units === 'metric' ? feelsLike * 9 / 5 + 32 : feelsLike
  const stops = TEMP_COLOR_STOPS
  if (f <= stops[0][0]) return `hsl(${stops[0][1]},${stops[0][2]}%,${stops[0][3]}%)`
  if (f >= stops[stops.length - 1][0]) { const s = stops[stops.length - 1]; return `hsl(${s[1]},${s[2]}%,${s[3]}%)` }
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, h0, s0, l0] = stops[i]
    const [t1, h1, s1, l1] = stops[i + 1]
    if (f >= t0 && f <= t1) {
      const p = (f - t0) / (t1 - t0)
      return `hsl(${Math.round(h0 + p * (h1 - h0))},${Math.round(s0 + p * (s1 - s0))}%,${Math.round(l0 + p * (l1 - l0))}%)`
    }
  }
}

export function initDailySection(el) {
  let selectedIdx = 0
  let _daily = null
  let _hourly = null
  let _units = null

  function renderHourlyPanel() {
    const panelEl = el.querySelector('.hourly-panel')
    if (!panelEl || !_hourly || !_daily) return

    const day = _daily[selectedIdx]
    const date = day.date
    const dayMin = day.tempMin
    const dayMax = day.tempMax
    const hours = _hourly.filter(h => h.time.startsWith(date))

    if (hours.length === 0) {
      panelEl.innerHTML = ''
      return
    }

    panelEl.innerHTML = hours.map(h => {
      const hour = parseInt(h.time.slice(11, 13), 10)
      const isDay = hour >= 6 && hour < 20
      const icon = getWeatherIcon(h.weatherCode, isDay, { size: 20 })
      const pos = dayMax > dayMin ? Math.max(0, Math.min(1, (h.temp - dayMin) / (dayMax - dayMin))) : 0.5
      const dotColor = tempFeelsColor(h.feelsLike, _units)
      const dotPct = Math.round(pos * 100)
      return `
        <div class="hourly-row">
          <span class="hourly-time-icon">
            <span class="hourly-time">${formatHour(h.time)}</span>
            <span class="hourly-icon">${icon}</span>
          </span>
          <span class="hourly-temp-feels">
            <span class="hourly-temp">${formatTemp(h.temp, _units)}</span>
            <span class="hourly-feels">Feels ${formatTemp(h.feelsLike, _units)}</span>
          </span>
          <span class="hourly-bar" aria-hidden="true">
            <span class="hourly-bar-dot" style="left:${dotPct}%;background:${dotColor}"></span>
          </span>
          <span class="hourly-wind">${formatWind(h.windSpeed, _units)}</span>
          <span class="hourly-precip">${formatPercent(h.precipProb)}</span>
        </div>
      `
    }).join('')
  }

  function attachDayClicks() {
    el.querySelectorAll('.forecast-day').forEach((dayEl, i) => {
      dayEl.addEventListener('click', () => {
        selectedIdx = i
        el.querySelectorAll('.forecast-day').forEach((d, j) => {
          d.classList.toggle('selected', j === selectedIdx)
        })
        renderHourlyPanel()
      })
    })
  }

  return {
    render(dailyData, hourlyData, units) {
      _daily = dailyData
      _hourly = hourlyData
      _units = units

      const rows = dailyData.map((day, i) => {
        const icon = getWeatherIcon(day.weatherCode, true, { size: 24 })
        const precipClass = day.precipProbMax > 20 ? 'forecast-precip' : 'forecast-precip forecast-precip-muted'
        const selectedClass = i === selectedIdx ? ' selected' : ''
        return `
          <div class="forecast-day${selectedClass}">
            <span class="forecast-day-label">
              <span class="forecast-day-weekday">${dayWeekday(day.date)}</span>
              <span class="forecast-day-monthday">${dayMonthDay(day.date)}</span>
            </span>
            <span class="forecast-icon">${icon}</span>
            <div class="forecast-temps">
              <span class="forecast-high">${fmtStripTemp(day.tempMax, units)}</span>
              <span class="forecast-low">${fmtStripTemp(day.tempMin, units)}</span>
            </div>
            <span class="${precipClass}">${formatPercent(day.precipProbMax)}</span>
          </div>
        `
      }).join('')

      el.innerHTML = `
        <div class="forecast-section-label">7-Day Forecast</div>
        <div class="forecast-strip">${rows}</div>
        <div class="hourly-panel"></div>
      `

      attachDayClicks()
      renderHourlyPanel()
    },

    showSkeleton() {
      const skeletonRows = Array.from({ length: 7 }, () => `
        <div class="forecast-day skeleton">
          <span class="forecast-day-label skeleton-block" style="width:48px;height:12px;"></span>
          <span class="forecast-icon skeleton-block" style="width:24px;height:24px;border-radius:4px;"></span>
          <div class="forecast-temps">
            <span class="forecast-high skeleton-block" style="width:36px;height:14px;"></span>
            <span class="forecast-low skeleton-block" style="width:28px;height:12px;"></span>
          </div>
          <span class="forecast-precip skeleton-block" style="width:28px;height:10px;"></span>
        </div>
      `).join('')

      el.innerHTML = `
        <div class="forecast-section-label">7-Day Forecast</div>
        <div class="forecast-strip">${skeletonRows}</div>
      `
    },

    showError(msg, onRetry) {
      el.innerHTML = `
        <div class="daily-error" style="padding:16px;text-align:center;">
          <p style="color:var(--fg-muted);margin-bottom:12px;">${msg}</p>
          <button class="retry-btn" style="padding:6px 16px;cursor:pointer;">Retry</button>
        </div>
      `
      el.querySelector('.retry-btn').addEventListener('click', onRetry)
    },
  }
}
