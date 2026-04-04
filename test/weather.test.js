import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeather, ApiError } from '../src/weather.js'
import { fetchWeather } from '../src/openmeteo.js'

vi.mock('../src/openmeteo.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, fetchWeather: vi.fn() }
})

// --- fixture data ---

const MOCK_PAYLOAD = {
  current: {
    temp: 18.5,
    feelsLike: 16.2,
    humidity: 72,
    windSpeed: 14.4,
    windDir: 220,
    uvIndex: 3.5,
    visibility: 24140,
    weatherCode: 3,
    isDay: true,
    time: '2026-04-04T12:00',
  },
  daily: [
    {
      date: '2026-04-04',
      tempMin: 10,
      tempMax: 19,
      precipSum: 0,
      precipProbMax: 5,
      weatherCode: 3,
      sunrise: '2026-04-04T06:15',
      sunset: '2026-04-04T19:45',
    },
  ],
  units: { temp: '°C', wind: 'km/h', precip: 'mm' },
}

// --- tests ---

describe('getWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('delegates to fetchWeather with the correct arguments and returns its result', async () => {
    fetchWeather.mockResolvedValue(MOCK_PAYLOAD)

    const result = await getWeather(51.5074, -0.1278, 'metric')

    expect(fetchWeather).toHaveBeenCalledOnce()
    expect(fetchWeather).toHaveBeenCalledWith(51.5074, -0.1278, 'metric')
    expect(result).toBe(MOCK_PAYLOAD)
  })

  it('lets ApiError propagate when fetchWeather throws', async () => {
    const error = new ApiError(500, 'HTTP error 500')
    fetchWeather.mockRejectedValue(error)

    await expect(getWeather(51.5074, -0.1278, 'metric')).rejects.toThrow(ApiError)
    const err = await getWeather(51.5074, -0.1278, 'metric').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(500)
    expect(err.message).toBe('HTTP error 500')
  })
})
