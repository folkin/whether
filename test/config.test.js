import { describe, it, expect } from 'vitest'
import { API, STORAGE_KEYS, CACHE_NAMES } from '../src/config.js'

describe('Config & Constants', () => {
  describe('API', () => {
    it('API.openMeteo.base is a non-empty string starting with https://', () => {
      expect(typeof API.openMeteo.base).toBe('string')
      expect(API.openMeteo.base.length).toBeGreaterThan(0)
      expect(API.openMeteo.base.startsWith('https://')).toBe(true)
    })

    it('API.rainViewer.manifest is a non-empty string starting with https://', () => {
      expect(typeof API.rainViewer.manifest).toBe('string')
      expect(API.rainViewer.manifest.length).toBeGreaterThan(0)
      expect(API.rainViewer.manifest.startsWith('https://')).toBe(true)
    })

    it('API.cartoDB.light contains {z}/{x}/{y}', () => {
      expect(typeof API.cartoDB.light).toBe('string')
      expect(API.cartoDB.light).toContain('{z}/{x}/{y}')
    })

    it('API.cartoDB.dark contains {z}/{x}/{y}', () => {
      expect(typeof API.cartoDB.dark).toBe('string')
      expect(API.cartoDB.dark).toContain('{z}/{x}/{y}')
    })
  })

  describe('STORAGE_KEYS', () => {
    it('all values are non-empty strings', () => {
      for (const [key, value] of Object.entries(STORAGE_KEYS)) {
        expect(typeof value, `STORAGE_KEYS.${key} should be a string`).toBe('string')
        expect(value.length, `STORAGE_KEYS.${key} should be non-empty`).toBeGreaterThan(0)
      }
    })

    it('all values are unique (no duplicates)', () => {
      const values = Object.values(STORAGE_KEYS)
      const unique = new Set(values)
      expect(unique.size).toBe(values.length)
    })
  })

  describe('CACHE_NAMES', () => {
    it('all values are non-empty strings', () => {
      for (const [key, value] of Object.entries(CACHE_NAMES)) {
        expect(typeof value, `CACHE_NAMES.${key} should be a string`).toBe('string')
        expect(value.length, `CACHE_NAMES.${key} should be non-empty`).toBeGreaterThan(0)
      }
    })

    it('all values are unique', () => {
      const values = Object.values(CACHE_NAMES)
      const unique = new Set(values)
      expect(unique.size).toBe(values.length)
    })
  })
})
