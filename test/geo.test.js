import { describe, it, expect, beforeEach, vi } from 'vitest'
import { requestLocation } from '../src/geo.js'

// Mock setLocation so localStorage is never touched in these tests
vi.mock('../src/storage.js', () => ({
  setLocation: vi.fn(),
}))

import { setLocation } from '../src/storage.js'

// Helper — collect the next window event of a given type into a promise
function nextWindowEvent(type) {
  return new Promise((resolve) => {
    window.addEventListener(type, (e) => resolve(e), { once: true })
  })
}

// Install a fake navigator.geolocation before each test
beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn(),
    },
  })
})

describe('requestLocation', () => {
  describe('success path', () => {
    const LAT = 51.5074
    const LON = -0.1278

    beforeEach(() => {
      navigator.geolocation.getCurrentPosition.mockImplementation(
        (successCb) => {
          successCb({ coords: { latitude: LAT, longitude: LON } })
        },
      )
    })

    it('resolves with { lat, lon }', async () => {
      const result = await requestLocation()
      expect(result).toEqual({ lat: LAT, lon: LON })
    })

    it('calls setLocation with the correct coordinates', async () => {
      await requestLocation()
      expect(setLocation).toHaveBeenCalledOnce()
      expect(setLocation).toHaveBeenCalledWith(LAT, LON)
    })

    it('dispatches geo:locationUpdated on window with { lat, lon }', async () => {
      const eventPromise = nextWindowEvent('geo:locationUpdated')
      await requestLocation()
      const event = await eventPromise
      expect(event.detail).toEqual({ lat: LAT, lon: LON })
    })
  })

  describe('error path', () => {
    const GEO_ERROR = { code: 1, message: 'User denied Geolocation' }

    beforeEach(() => {
      navigator.geolocation.getCurrentPosition.mockImplementation(
        (_successCb, errorCb) => {
          errorCb(GEO_ERROR)
        },
      )
    })

    it('rejects with { code, message }', async () => {
      await expect(requestLocation()).rejects.toEqual({
        code: GEO_ERROR.code,
        message: GEO_ERROR.message,
      })
    })

    it('does not call setLocation', async () => {
      await requestLocation().catch(() => {})
      expect(setLocation).not.toHaveBeenCalled()
    })

    it('dispatches geo:locationError on window with { code, message }', async () => {
      const eventPromise = nextWindowEvent('geo:locationError')
      await requestLocation().catch(() => {})
      const event = await eventPromise
      expect(event.detail).toEqual({
        code: GEO_ERROR.code,
        message: GEO_ERROR.message,
      })
    })
  })
})
