import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLocation, setLocation,
  getTheme, setTheme,
  getUnits, setUnits,
  getActiveTab, setActiveTab,
  getCachedWeather, setCachedWeather,
} from '../src/storage.js'
import { STORAGE_KEYS } from '../src/config.js'

describe('Storage', () => {
  beforeEach(() => localStorage.clear())

  // --- getLocation / setLocation ---

  describe('getLocation', () => {
    it('returns null on cold start', () => {
      expect(getLocation()).toBeNull()
    })

    it('returns { lat, lon } after setLocation', () => {
      setLocation(51.5074, -0.1278)
      expect(getLocation()).toEqual({ lat: 51.5074, lon: -0.1278 })
    })

    it('returns null after corrupt JSON is injected', () => {
      localStorage.setItem(STORAGE_KEYS.lat, 'not-json{{{')
      expect(getLocation()).toBeNull()
    })

    it('returns null when stored JSON is missing lat', () => {
      localStorage.setItem(STORAGE_KEYS.lat, JSON.stringify({ lon: -0.1278 }))
      expect(getLocation()).toBeNull()
    })

    it('returns null when lat or lon is not a finite number', () => {
      localStorage.setItem(STORAGE_KEYS.lat, JSON.stringify({ lat: 'bad', lon: -0.1278 }))
      expect(getLocation()).toBeNull()
    })
  })

  // --- getTheme / setTheme ---

  describe('getTheme', () => {
    it('returns "system" on cold start', () => {
      expect(getTheme()).toBe('system')
    })

    it('round-trips "light"', () => {
      setTheme('light')
      expect(getTheme()).toBe('light')
    })

    it('round-trips "dark"', () => {
      setTheme('dark')
      expect(getTheme()).toBe('dark')
    })

    it('round-trips "system"', () => {
      setTheme('system')
      expect(getTheme()).toBe('system')
    })

    it('returns "system" for an invalid stored value', () => {
      localStorage.setItem(STORAGE_KEYS.theme, 'neon')
      expect(getTheme()).toBe('system')
    })
  })

  // --- getUnits / setUnits ---

  describe('getUnits', () => {
    it('returns "metric" on cold start', () => {
      expect(getUnits()).toBe('metric')
    })

    it('round-trips "metric"', () => {
      setUnits('metric')
      expect(getUnits()).toBe('metric')
    })

    it('round-trips "imperial"', () => {
      setUnits('imperial')
      expect(getUnits()).toBe('imperial')
    })

    it('returns "metric" for an invalid stored value', () => {
      localStorage.setItem(STORAGE_KEYS.units, 'kelvin')
      expect(getUnits()).toBe('metric')
    })
  })

  // --- getActiveTab / setActiveTab ---

  describe('getActiveTab', () => {
    it('returns "weather" on cold start', () => {
      expect(getActiveTab()).toBe('weather')
    })

    it('round-trips "weather"', () => {
      setActiveTab('weather')
      expect(getActiveTab()).toBe('weather')
    })

    it('round-trips "radar"', () => {
      setActiveTab('radar')
      expect(getActiveTab()).toBe('radar')
    })

    it('returns "weather" for an invalid stored value', () => {
      localStorage.setItem(STORAGE_KEYS.activeTab, 'satellite')
      expect(getActiveTab()).toBe('weather')
    })
  })

  // --- getCachedWeather / setCachedWeather ---

  describe('getCachedWeather', () => {
    it('returns null on cold start', () => {
      expect(getCachedWeather()).toBeNull()
    })

    it('round-trips a data object and fetchedAt is a number close to Date.now()', () => {
      const before = Date.now()
      const weatherData = { temperature: 22, windspeed: 5 }
      setCachedWeather(weatherData)
      const after = Date.now()

      const result = getCachedWeather()
      expect(result).not.toBeNull()
      expect(result.data).toEqual(weatherData)
      expect(typeof result.fetchedAt).toBe('number')
      expect(result.fetchedAt).toBeGreaterThanOrEqual(before)
      expect(result.fetchedAt).toBeLessThanOrEqual(after)
    })

    it('returns null after corrupt JSON is injected', () => {
      localStorage.setItem(STORAGE_KEYS.weatherCache, '}{invalid')
      expect(getCachedWeather()).toBeNull()
    })

    it('returns null when fetchedAt is not a number', () => {
      localStorage.setItem(
        STORAGE_KEYS.weatherCache,
        JSON.stringify({ data: {}, fetchedAt: 'yesterday' }),
      )
      expect(getCachedWeather()).toBeNull()
    })
  })
})
