import { describe, it, expect } from 'vitest'
import { getWeatherIcon, getWeatherLabel } from '../src/icons.js'

const ALL_WMO_CODES = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]

describe('getWeatherIcon', () => {
  it('returns a non-empty string for every WMO code (isDay=true)', () => {
    for (const code of ALL_WMO_CODES) {
      const result = getWeatherIcon(code, true)
      expect(result, `code ${code} isDay=true`).toBeTruthy()
      expect(typeof result, `code ${code} isDay=true`).toBe('string')
      expect(result.length, `code ${code} isDay=true`).toBeGreaterThan(0)
    }
  })

  it('returns a non-empty string for every WMO code (isDay=false)', () => {
    for (const code of ALL_WMO_CODES) {
      const result = getWeatherIcon(code, false)
      expect(result, `code ${code} isDay=false`).toBeTruthy()
      expect(typeof result, `code ${code} isDay=false`).toBe('string')
      expect(result.length, `code ${code} isDay=false`).toBeGreaterThan(0)
    }
  })

  it('returned string contains <svg for every WMO code', () => {
    for (const code of ALL_WMO_CODES) {
      expect(getWeatherIcon(code, true), `code ${code}`).toContain('<svg')
      expect(getWeatherIcon(code, false), `code ${code}`).toContain('<svg')
    }
  })

  it('code 0 isDay=true uses the yellow color token', () => {
    const svg = getWeatherIcon(0, true)
    expect(svg).toContain('var(--vscode-charts-yellow)')
  })

  it('code 63 (rain) uses the blue color token', () => {
    const svg = getWeatherIcon(63, true)
    expect(svg).toContain('var(--vscode-charts-blue)')
  })

  it('code 95 (thunderstorm) uses the red color token', () => {
    const svg = getWeatherIcon(95, true)
    expect(svg).toContain('var(--vscode-charts-red)')
  })

  it('unknown code returns a non-empty SVG string (fallback to Cloud + blue)', () => {
    const svg = getWeatherIcon(999, true)
    expect(svg).toBeTruthy()
    expect(svg).toContain('<svg')
    expect(svg).toContain('var(--vscode-charts-blue)')
  })

  it('opts.size is reflected in width and height attributes', () => {
    const svg = getWeatherIcon(0, true, { size: 48 })
    expect(svg).toContain('width="48"')
    expect(svg).toContain('height="48"')
  })

  it('opts.className is added to the svg element', () => {
    const svg = getWeatherIcon(0, true, { className: 'weather-icon' })
    expect(svg).toContain('class="weather-icon"')
  })
})

describe('getWeatherLabel', () => {
  it('returns "Clear" for code 0', () => {
    expect(getWeatherLabel(0)).toBe('Clear')
  })

  it('returns "Thunderstorm" for code 95', () => {
    expect(getWeatherLabel(95)).toBe('Thunderstorm')
  })

  it('returns a non-empty string for every WMO code', () => {
    for (const code of ALL_WMO_CODES) {
      const label = getWeatherLabel(code)
      expect(label, `code ${code}`).toBeTruthy()
      expect(typeof label, `code ${code}`).toBe('string')
    }
  })

  it('returns a non-empty fallback string for unknown codes', () => {
    const label = getWeatherLabel(999)
    expect(label).toBeTruthy()
    expect(typeof label).toBe('string')
  })
})
