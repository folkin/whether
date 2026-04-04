// Weather Provider (Piece 5)
// Thin seam between the App Shell and the Open-Meteo client.
// The App Shell imports all weather data through this module — never from
// the Open-Meteo client directly. Swapping the data source requires editing
// only this file; the App Shell is unaffected.
// Depends on: ./openmeteo.js (fetchWeather, ApiError)

export { ApiError } from './openmeteo.js'
import { fetchWeather } from './openmeteo.js'

export async function getWeather(lat, lon, units) {
  return fetchWeather(lat, lon, units)
}
