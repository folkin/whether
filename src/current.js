// Current Conditions Renderer (Piece 9)
// Renders the hero section: large temperature, feels-like, weather icon, condition label,
// humidity, wind, UV index, visibility.
// Manages its own skeleton and error states. Reads nothing from Storage or network.
// Depends on: icons.js, units.js

import { getWeatherIcon, getWeatherLabel } from './icons.js'
import { formatTemp, formatWind, formatPercent } from './units.js'

function formatVisibility(meters, units) {
  if (units === 'imperial') {
    return `${(meters / 1609).toFixed(1)} mi`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

export function initCurrentSection(el) {
  return {
    render(data, units) {
      const icon = getWeatherIcon(data.weatherCode, data.isDay, { size: 48 })
      const label = getWeatherLabel(data.weatherCode)
      const temp = formatTemp(data.temp, units)
      const feelsLike = formatTemp(data.feelsLike, units)
      const humidity = formatPercent(data.humidity)
      const wind = formatWind(data.windSpeed, units)
      const uv = data.uvIndex.toFixed(1)
      const visibility = formatVisibility(data.visibility, units)

      el.innerHTML = `
        <div class="current-card">
          <div class="current-top">
            <div class="current-temp-block">
              <div class="current-temp">${temp}</div>
              <div class="current-feels">Feels like ${feelsLike}</div>
              <div class="current-condition">
                ${icon}
                <span>${label}</span>
              </div>
            </div>
          </div>
          <div class="current-details">
            <div class="detail-item">
              <span class="detail-label">Humidity</span>
              <span class="detail-value">${humidity}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Wind</span>
              <span class="detail-value">${wind}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">UV Index</span>
              <span class="detail-value">${uv}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Visibility</span>
              <span class="detail-value">${visibility}</span>
            </div>
          </div>
        </div>
      `
    },

    showSkeleton() {
      el.innerHTML = `
        <div class="current-card">
          <div class="current-top">
            <div class="current-temp-block">
              <div class="skeleton" style="width: 140px; height: 80px; border-radius: 6px;"></div>
              <div class="skeleton" style="width: 120px; height: 16px; border-radius: 4px; margin-top: 8px;"></div>
              <div class="skeleton" style="width: 100px; height: 20px; border-radius: 4px; margin-top: 12px;"></div>
            </div>
          </div>
          <div class="current-details" style="padding-top: 16px; border-top: 1px solid var(--border);">
            <div class="skeleton" style="height: 40px; border-radius: 4px;"></div>
            <div class="skeleton" style="height: 40px; border-radius: 4px;"></div>
            <div class="skeleton" style="height: 40px; border-radius: 4px;"></div>
            <div class="skeleton" style="height: 40px; border-radius: 4px;"></div>
          </div>
        </div>
      `
    },

    showError(msg, onRetry) {
      el.innerHTML = `
        <div class="current-card" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 24px;">
          <span style="color: var(--fg-muted); font-size: 0.95rem;">${msg}</span>
          <button class="retry-btn" style="padding: 8px 20px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--fg); cursor: pointer; font-size: 0.9rem;">Retry</button>
        </div>
      `
      el.querySelector('.retry-btn').addEventListener('click', onRetry)
    },
  }
}
