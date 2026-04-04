import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatTemp,
  formatWind,
  formatPrecip,
  formatPercent,
  formatDate,
  formatTime,
  formatRelativeTime,
} from '../src/units.js'

describe('Units Formatter', () => {
  describe('formatTemp', () => {
    it('returns °C for metric', () => {
      expect(formatTemp(21.4, 'metric')).toBe('21°C')
    })
    it('rounds to nearest integer (metric)', () => {
      expect(formatTemp(21.6, 'metric')).toBe('22°C')
    })
    it('returns °F for imperial', () => {
      expect(formatTemp(70.2, 'imperial')).toBe('70°F')
    })
    it('rounds to nearest integer (imperial)', () => {
      expect(formatTemp(70.7, 'imperial')).toBe('71°F')
    })
    it('handles negative temperatures', () => {
      expect(formatTemp(-3.6, 'metric')).toBe('-4°C')
    })
  })

  describe('formatWind', () => {
    it('returns km/h for metric', () => {
      expect(formatWind(18, 'metric')).toBe('18 km/h')
    })
    it('rounds to nearest integer (metric)', () => {
      expect(formatWind(18.7, 'metric')).toBe('19 km/h')
    })
    it('returns mph for imperial', () => {
      expect(formatWind(11, 'imperial')).toBe('11 mph')
    })
    it('rounds to nearest integer (imperial)', () => {
      expect(formatWind(11.4, 'imperial')).toBe('11 mph')
    })
    it('handles zero wind', () => {
      expect(formatWind(0, 'metric')).toBe('0 km/h')
    })
  })

  describe('formatPrecip', () => {
    it('returns mm for metric with one decimal', () => {
      expect(formatPrecip(4.2, 'metric')).toBe('4.2 mm')
    })
    it('returns in for imperial with one decimal', () => {
      expect(formatPrecip(0.17, 'imperial')).toBe('0.2 in')
    })
    it('shows one decimal even for whole numbers', () => {
      expect(formatPrecip(5, 'metric')).toBe('5.0 mm')
    })
    it('rounds to one decimal place', () => {
      expect(formatPrecip(2.35, 'metric')).toBe('2.4 mm')
    })
    it('handles zero precipitation', () => {
      expect(formatPrecip(0, 'imperial')).toBe('0.0 in')
    })
  })

  describe('formatPercent', () => {
    it('appends % sign', () => {
      expect(formatPercent(73)).toContain('%')
    })
    it('rounds to nearest integer', () => {
      expect(formatPercent(73.4)).toBe('73%')
      expect(formatPercent(73.6)).toBe('74%')
    })
    it('handles 0%', () => {
      expect(formatPercent(0)).toBe('0%')
    })
    it('handles 100%', () => {
      expect(formatPercent(100)).toBe('100%')
    })
  })

  describe('formatDate', () => {
    it('includes month abbreviation', () => {
      const result = formatDate('2026-04-05')
      expect(result).toContain('Apr')
    })
    it('includes day of week abbreviation', () => {
      const result = formatDate('2026-04-05')
      expect(result).toContain('Sun')
    })
    it('includes day number', () => {
      const result = formatDate('2026-04-05')
      expect(result).toContain('5')
    })
    it('does not shift day due to UTC midnight (Apr 05 stays Apr 05)', () => {
      // 2026-04-05 is a Sunday; without T12:00:00 fix UTC midnight could show Apr 4
      const result = formatDate('2026-04-05')
      expect(result).toContain('Apr')
      expect(result).not.toMatch(/Apr 4\b/)
    })
    it('formats another known date correctly', () => {
      // 2026-01-01 is a Thursday
      const result = formatDate('2026-01-01')
      expect(result).toContain('Jan')
      expect(result).toContain('Thu')
    })
  })

  describe('formatTime', () => {
    it('includes AM or PM', () => {
      const result = formatTime('2026-04-04T09:00')
      expect(result).toMatch(/AM|PM/)
    })
    it('formats morning time correctly', () => {
      const result = formatTime('2026-04-04T09:00')
      expect(result).toContain('AM')
    })
    it('formats afternoon time correctly', () => {
      const result = formatTime('2026-04-04T15:42')
      expect(result).toContain('PM')
    })
    it('includes minutes with two digits', () => {
      const result = formatTime('2026-04-04T09:05')
      expect(result).toMatch(/05/)
    })
    it('formats noon correctly', () => {
      const result = formatTime('2026-04-04T12:00')
      expect(result).toContain('PM')
    })
    it('formats midnight correctly', () => {
      const result = formatTime('2026-04-04T00:00')
      expect(result).toContain('AM')
    })
  })

  describe('formatRelativeTime', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('returns "just now" for less than 60 seconds ago', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 30_000)).toBe('just now')
    })

    it('returns "just now" at exactly 0 seconds ago', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now)).toBe('just now')
    })

    it('returns "X minutes ago" for 1-59 minutes', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 5 * 60_000)).toBe('5 minutes ago')
    })

    it('uses singular for 1 minute ago', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 90_000)).toBe('1 minute ago')
    })

    it('returns "X hours ago" for 1-23 hours', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 4 * 3600_000)).toBe('4 hours ago')
    })

    it('uses singular for 1 hour ago', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 1 * 3600_000)).toBe('1 hour ago')
    })

    it('returns "X days ago" for 24+ hours', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 2 * 86400_000)).toBe('2 days ago')
    })

    it('uses singular for 1 day ago', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(formatRelativeTime(now - 1 * 86400_000)).toBe('1 day ago')
    })
  })
})
