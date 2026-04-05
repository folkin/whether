import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchWeather, ApiError } from '../src/openmeteo.js'
import { API } from '../src/config.js'

// --- fixture data ---

function makeHourlyBlock() {
  const days = ['2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10']
  const time = days.flatMap(d => Array.from({ length: 24 }, (_, h) => `${d}T${String(h).padStart(2,'0')}:00`))
  return {
    time,
    temperature_2m:          time.map(() => 15),
    apparent_temperature:     time.map(() => 13),
    precipitation_probability: time.map(() => 10),
    precipitation:            time.map(() => 0),
    weather_code:             time.map(() => 3),
    wind_speed_10m:           time.map(() => 12),
  }
}

const MOCK_RESPONSE = {
  current_units: {
    temperature_2m: '°C',
    wind_speed_10m: 'km/h',
  },
  daily_units: {
    precipitation_sum: 'mm',
  },
  current: {
    temperature_2m: 18.5,
    apparent_temperature: 16.2,
    relative_humidity_2m: 72,
    wind_speed_10m: 14.4,
    wind_direction_10m: 220,
    uv_index: 3.5,
    visibility: 24140,
    weather_code: 3,
    is_day: 1,
    time: '2026-04-04T12:00',
  },
  daily: {
    time: ['2026-04-04', '2026-04-05', '2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10'],
    temperature_2m_max: [19, 21, 20, 18, 17, 22, 23],
    temperature_2m_min: [10, 12, 11, 9, 8, 13, 14],
    precipitation_sum: [0, 2.4, 0, 5.1, 0.2, 0, 0],
    precipitation_probability_max: [5, 40, 10, 70, 20, 0, 0],
    weather_code: [3, 61, 3, 65, 51, 0, 1],
    sunrise: [
      '2026-04-04T06:15', '2026-04-05T06:13', '2026-04-06T06:11',
      '2026-04-07T06:09', '2026-04-08T06:07', '2026-04-09T06:05', '2026-04-10T06:03',
    ],
    sunset: [
      '2026-04-04T19:45', '2026-04-05T19:47', '2026-04-06T19:49',
      '2026-04-07T19:51', '2026-04-08T19:53', '2026-04-09T19:55', '2026-04-10T19:57',
    ],
  },
  hourly: makeHourlyBlock(),
}

const MOCK_RESPONSE_IMPERIAL = {
  current_units: {
    temperature_2m: '°F',
    wind_speed_10m: 'mph',
  },
  daily_units: {
    precipitation_sum: 'inch',
  },
  current: { ...MOCK_RESPONSE.current },
  daily: { ...MOCK_RESPONSE.daily },
  hourly: makeHourlyBlock(),
}

function makeFetchOk(body) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  })
}

function makeFetchError(status) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: true }),
  })
}

// --- tests ---

describe('fetchWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // --- happy path ---

  describe('metric — returns correctly shaped WeatherPayload', () => {
    let result

    beforeEach(async () => {
      vi.stubGlobal('fetch', makeFetchOk(MOCK_RESPONSE))
      result = await fetchWeather(51.5074, -0.1278, 'metric')
    })

    it('current.temp is mapped from temperature_2m', () => {
      expect(result.current.temp).toBe(18.5)
    })

    it('current.feelsLike is mapped from apparent_temperature', () => {
      expect(result.current.feelsLike).toBe(16.2)
    })

    it('current.humidity is mapped from relative_humidity_2m', () => {
      expect(result.current.humidity).toBe(72)
    })

    it('current.windSpeed is mapped from wind_speed_10m', () => {
      expect(result.current.windSpeed).toBe(14.4)
    })

    it('current.windDir is mapped from wind_direction_10m', () => {
      expect(result.current.windDir).toBe(220)
    })

    it('current.uvIndex is mapped from uv_index', () => {
      expect(result.current.uvIndex).toBe(3.5)
    })

    it('current.visibility is mapped from visibility', () => {
      expect(result.current.visibility).toBe(24140)
    })

    it('current.weatherCode is mapped from weather_code', () => {
      expect(result.current.weatherCode).toBe(3)
    })

    it('current.isDay is true when is_day === 1', () => {
      expect(result.current.isDay).toBe(true)
    })

    it('current.time is an ISO string', () => {
      expect(result.current.time).toBe('2026-04-04T12:00')
    })

    it('daily has 7 entries', () => {
      expect(result.daily).toHaveLength(7)
    })

    it('daily[0] has correct shape', () => {
      expect(result.daily[0]).toEqual({
        date: '2026-04-04',
        tempMax: 19,
        tempMin: 10,
        precipSum: 0,
        precipProbMax: 5,
        weatherCode: 3,
        sunrise: '2026-04-04T06:15',
        sunset: '2026-04-04T19:45',
      })
    })

    it('daily[2] precipSum and precipProbMax are correct', () => {
      expect(result.daily[2].precipSum).toBe(0)
      expect(result.daily[2].precipProbMax).toBe(10)
    })

    it('units.temp is °C for metric', () => {
      expect(result.units.temp).toBe('°C')
    })

    it('units.wind is km/h for metric', () => {
      expect(result.units.wind).toBe('km/h')
    })

    it('units.precip is mm for metric', () => {
      expect(result.units.precip).toBe('mm')
    })
  })

  describe('imperial — units strings reflect imperial response', () => {
    let result

    beforeEach(async () => {
      vi.stubGlobal('fetch', makeFetchOk(MOCK_RESPONSE_IMPERIAL))
      result = await fetchWeather(51.5074, -0.1278, 'imperial')
    })

    it('units.temp is °F for imperial', () => {
      expect(result.units.temp).toBe('°F')
    })

    it('units.wind is mph for imperial', () => {
      expect(result.units.wind).toBe('mph')
    })

    it('units.precip is inch for imperial', () => {
      expect(result.units.precip).toBe('inch')
    })
  })

  // --- isDay false case ---

  it('current.isDay is false when is_day === 0', async () => {
    const nightResponse = {
      ...MOCK_RESPONSE,
      current: { ...MOCK_RESPONSE.current, is_day: 0 },
    }
    vi.stubGlobal('fetch', makeFetchOk(nightResponse))
    const result = await fetchWeather(51.5074, -0.1278, 'metric')
    expect(result.current.isDay).toBe(false)
  })

  // --- URL construction ---

  describe('URL construction — metric', () => {
    let capturedUrl

    beforeEach(async () => {
      const mockFetch = vi.fn().mockImplementation((url) => {
        capturedUrl = url
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(MOCK_RESPONSE),
        })
      })
      vi.stubGlobal('fetch', mockFetch)
      await fetchWeather(51.5074, -0.1278, 'metric')
    })

    it('URL starts with API.openMeteo.base', () => {
      expect(capturedUrl.startsWith(API.openMeteo.base)).toBe(true)
    })

    it('URL includes correct latitude', () => {
      expect(capturedUrl).toContain('latitude=51.5074')
    })

    it('URL includes correct longitude', () => {
      expect(capturedUrl).toContain('longitude=-0.1278')
    })

    it('URL includes timezone=auto', () => {
      expect(capturedUrl).toContain('timezone=auto')
    })

    it('URL includes forecast_days=7', () => {
      expect(capturedUrl).toContain('forecast_days=7')
    })

    it('URL does NOT include temperature_unit for metric', () => {
      expect(capturedUrl).not.toContain('temperature_unit')
    })

    it('URL does NOT include wind_speed_unit for metric', () => {
      expect(capturedUrl).not.toContain('wind_speed_unit')
    })

    it('URL does NOT include precipitation_unit for metric', () => {
      expect(capturedUrl).not.toContain('precipitation_unit')
    })

    it('URL includes all required current fields', () => {
      expect(capturedUrl).toContain('temperature_2m')
      expect(capturedUrl).toContain('apparent_temperature')
      expect(capturedUrl).toContain('relative_humidity_2m')
      expect(capturedUrl).toContain('wind_speed_10m')
      expect(capturedUrl).toContain('wind_direction_10m')
      expect(capturedUrl).toContain('uv_index')
      expect(capturedUrl).toContain('visibility')
      expect(capturedUrl).toContain('weather_code')
      expect(capturedUrl).toContain('is_day')
    })

    it('URL includes all required daily fields', () => {
      expect(capturedUrl).toContain('temperature_2m_max')
      expect(capturedUrl).toContain('temperature_2m_min')
      expect(capturedUrl).toContain('precipitation_sum')
      expect(capturedUrl).toContain('precipitation_probability_max')
      expect(capturedUrl).toContain('sunrise')
      expect(capturedUrl).toContain('sunset')
    })
  })

  describe('URL construction — imperial', () => {
    let capturedUrl

    beforeEach(async () => {
      const mockFetch = vi.fn().mockImplementation((url) => {
        capturedUrl = url
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(MOCK_RESPONSE_IMPERIAL),
        })
      })
      vi.stubGlobal('fetch', mockFetch)
      await fetchWeather(40.7128, -74.006, 'imperial')
    })

    it('URL includes temperature_unit=fahrenheit', () => {
      expect(capturedUrl).toContain('temperature_unit=fahrenheit')
    })

    it('URL includes wind_speed_unit=mph', () => {
      expect(capturedUrl).toContain('wind_speed_unit=mph')
    })

    it('URL includes precipitation_unit=inch', () => {
      expect(capturedUrl).toContain('precipitation_unit=inch')
    })
  })

  // --- error cases ---

  describe('non-200 responses throw ApiError', () => {
    it('throws ApiError with status 404', async () => {
      vi.stubGlobal('fetch', makeFetchError(404))
      await expect(fetchWeather(0, 0, 'metric')).rejects.toThrow(ApiError)
    })

    it('ApiError.status is 404', async () => {
      vi.stubGlobal('fetch', makeFetchError(404))
      const err = await fetchWeather(0, 0, 'metric').catch((e) => e)
      expect(err.status).toBe(404)
    })

    it('throws ApiError with status 500', async () => {
      vi.stubGlobal('fetch', makeFetchError(500))
      const err = await fetchWeather(0, 0, 'metric').catch((e) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(500)
    })
  })

  describe('network failure throws ApiError', () => {
    it('throws ApiError when fetch rejects', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
      await expect(fetchWeather(0, 0, 'metric')).rejects.toThrow(ApiError)
    })

    it('ApiError.status is 0 on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
      const err = await fetchWeather(0, 0, 'metric').catch((e) => e)
      expect(err.status).toBe(0)
    })

    it('ApiError.message contains the original error message', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
      const err = await fetchWeather(0, 0, 'metric').catch((e) => e)
      expect(err.message).toBe('Failed to fetch')
    })
  })
})
