import { describe, it, expect, vi } from 'vitest'
import { initCurrentSection } from '../src/current.js'
import { formatTemp, formatPercent } from '../src/units.js'
import { getWeatherLabel } from '../src/icons.js'

const STATIC_CURRENT = {
  temp: 64.5,
  feelsLike: 64.4,
  humidity: 80,
  windSpeed: 6.6,
  windDir: 10,
  uvIndex: 1.75,
  visibility: 16093,  // ~10 miles in meters
  weatherCode: 3,
  isDay: true,
  time: '2026-04-04T09:00',
}

function makeEl() {
  return document.createElement('div')
}

describe('Current Conditions Renderer', () => {
  it('render() inserts content into the element', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.render(STATIC_CURRENT, 'imperial')
    expect(el.innerHTML.trim()).not.toBe('')
  })

  it('render() output contains the formatted temperature (imperial)', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.render(STATIC_CURRENT, 'imperial')
    const expected = formatTemp(STATIC_CURRENT.temp, 'imperial')
    expect(el.innerHTML).toContain(expected)
  })

  it('render() output contains the formatted temperature (metric)', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.render(STATIC_CURRENT, 'metric')
    const expected = formatTemp(STATIC_CURRENT.temp, 'metric')
    expect(el.innerHTML).toContain(expected)
  })

  it('render() output contains an <svg element (icon rendered)', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.render(STATIC_CURRENT, 'imperial')
    expect(el.innerHTML).toContain('<svg')
  })

  it('render() output contains the condition label for code 3 ("Cloudy")', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.render(STATIC_CURRENT, 'imperial')
    const label = getWeatherLabel(STATIC_CURRENT.weatherCode)
    expect(label).toBe('Cloudy')
    expect(el.innerHTML).toContain('Cloudy')
  })

  it('render() output contains the humidity value', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.render(STATIC_CURRENT, 'imperial')
    const expected = formatPercent(STATIC_CURRENT.humidity)
    expect(el.innerHTML).toContain(expected)
  })

  it('showSkeleton() inserts content into the element', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.showSkeleton()
    expect(el.innerHTML.trim()).not.toBe('')
  })

  it('showSkeleton() renders skeleton placeholder elements', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.showSkeleton()
    expect(el.querySelectorAll('.skeleton').length).toBeGreaterThanOrEqual(2)
  })

  it('showError() inserts content containing the error message', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.showError('Network error', () => {})
    expect(el.innerHTML).toContain('Network error')
  })

  it('showError() retry button click calls the onRetry callback', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    const onRetry = vi.fn()
    section.showError('Network error', onRetry)
    el.querySelector('.retry-btn').click()
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('calling render() after showSkeleton() replaces the skeleton content', () => {
    const el = makeEl()
    const section = initCurrentSection(el)
    section.showSkeleton()
    const skeletonContent = el.innerHTML
    section.render(STATIC_CURRENT, 'imperial')
    expect(el.innerHTML).not.toBe(skeletonContent)
    expect(el.querySelectorAll('.skeleton').length).toBe(0)
  })
})
