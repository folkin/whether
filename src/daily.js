// Daily Forecast Renderer (Piece 10)
// Renders the 7-day daily forecast: date, high/low temps, precip probability, weather icon.
// Manages its own skeleton and error states. Reads nothing from Storage or network.
// Depends on: icons.js, units.js

import { getWeatherIcon } from './icons.js'
import { formatDate, formatTemp, formatPercent } from './units.js'

export function initDailySection(el) {
  return {
    render(data, units) {
      const rows = data.map((day) => {
        const icon = getWeatherIcon(day.weatherCode, true, { size: 24 })
        const precipClass = day.precipProbMax > 20 ? 'forecast-precip' : 'forecast-precip forecast-precip-muted'
        return `
          <div class="forecast-day">
            <span class="forecast-day-label">${formatDate(day.date)}</span>
            <span class="forecast-icon">${icon}</span>
            <div class="forecast-temps">
              <span class="forecast-high">${formatTemp(day.tempMax, units)}</span>
              <span class="forecast-low">${formatTemp(day.tempMin, units)}</span>
            </div>
            <span class="${precipClass}">${formatPercent(day.precipProbMax)}</span>
          </div>
        `
      }).join('')

      el.innerHTML = `
        <div class="forecast-section-label">7-Day Forecast</div>
        <div class="forecast-strip">${rows}</div>
      `
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
