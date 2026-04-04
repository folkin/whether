// Open-Meteo Client (Piece 6)
// Fetches current conditions and 7-day daily forecast from Open-Meteo.
// Assembles the URL from Config, executes the fetch, and returns a normalized
// WeatherPayload. Does not cache, does not render.
// Depends on: config.js (API.openMeteo.base)

import { API } from './config.js'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.message = message
  }
}

export async function fetchWeather(lat, lon, units) {
  const url = buildUrl(lat, lon, units)

  let response
  try {
    response = await fetch(url)
  } catch (err) {
    throw new ApiError(0, err.message ?? 'Network error')
  }

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP error ${response.status}`)
  }

  const data = await response.json()
  return normalize(data)
}

// --- helpers ---

function buildUrl(lat, lon, units) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'visibility',
      'weather_code',
      'is_day',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'weather_code',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  })

  if (units === 'imperial') {
    params.set('temperature_unit', 'fahrenheit')
    params.set('wind_speed_unit', 'mph')
    params.set('precipitation_unit', 'inch')
  }

  return `${API.openMeteo.base}?${params.toString()}`
}

function normalize(data) {
  const { current, current_units, daily, daily_units } = data

  const currentPayload = {
    temp: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDir: current.wind_direction_10m,
    uvIndex: current.uv_index,
    visibility: current.visibility,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    time: current.time,
  }

  const dailyPayload = daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    precipSum: daily.precipitation_sum[i],
    precipProbMax: daily.precipitation_probability_max[i],
    weatherCode: daily.weather_code[i],
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
  }))

  const unitsPayload = {
    temp: current_units.temperature_2m,
    wind: current_units.wind_speed_10m,
    precip: daily_units.precipitation_sum,
  }

  return {
    current: currentPayload,
    daily: dailyPayload,
    units: unitsPayload,
  }
}
