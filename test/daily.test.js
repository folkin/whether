import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initDailySection } from '../src/daily.js'

const STATIC_DAILY = [
  { date: '2026-04-04', tempMin: 43.0, tempMax: 73.8, precipSum: 0.0,   precipProbMax: 7,  weatherCode: 3,  sunrise: '2026-04-04T06:30', sunset: '2026-04-04T19:45' },
  { date: '2026-04-05', tempMin: 42.2, tempMax: 70.8, precipSum: 0.154, precipProbMax: 76, weatherCode: 63, sunrise: '2026-04-05T06:28', sunset: '2026-04-05T19:46' },
  { date: '2026-04-06', tempMin: 40.7, tempMax: 56.9, precipSum: 0.0,   precipProbMax: 10, weatherCode: 3,  sunrise: '2026-04-06T06:27', sunset: '2026-04-06T19:48' },
  { date: '2026-04-07', tempMin: 33.8, tempMax: 51.5, precipSum: 0.0,   precipProbMax: 12, weatherCode: 3,  sunrise: '2026-04-07T06:25', sunset: '2026-04-07T19:49' },
  { date: '2026-04-08', tempMin: 32.2, tempMax: 44.1, precipSum: 0.0,   precipProbMax: 1,  weatherCode: 0,  sunrise: '2026-04-08T06:23', sunset: '2026-04-08T19:50' },
  { date: '2026-04-09', tempMin: 40.1, tempMax: 56.7, precipSum: 0.0,   precipProbMax: 4,  weatherCode: 3,  sunrise: '2026-04-09T06:22', sunset: '2026-04-09T19:51' },
  { date: '2026-04-10', tempMin: 44.5, tempMax: 58.8, precipSum: 0.0,   precipProbMax: 6,  weatherCode: 3,  sunrise: '2026-04-10T06:20', sunset: '2026-04-10T19:53' },
]

function makeEl() {
  return document.createElement('div')
}

describe('Daily Forecast Renderer', () => {
  let el
  let section

  beforeEach(() => {
    el = makeEl()
    section = initDailySection(el)
  })

  it('render() inserts content into el', () => {
    section.render(STATIC_DAILY, 'imperial')
    expect(el.innerHTML.trim()).not.toBe('')
  })

  it('render() produces 7 forecast-day rows', () => {
    section.render(STATIC_DAILY, 'imperial')
    const days = el.querySelectorAll('.forecast-day')
    expect(days.length).toBe(7)
  })

  it('render() output contains an <svg> for each row (at least 7 icons)', () => {
    section.render(STATIC_DAILY, 'imperial')
    const svgs = el.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(7)
  })

  it('render() with imperial units contains °F', () => {
    section.render(STATIC_DAILY, 'imperial')
    expect(el.innerHTML).toContain('°F')
  })

  it('render() with metric units contains °C', () => {
    section.render(STATIC_DAILY, 'metric')
    expect(el.innerHTML).toContain('°C')
  })

  it('showSkeleton() inserts content into el', () => {
    section.showSkeleton()
    expect(el.innerHTML.trim()).not.toBe('')
  })

  it('showSkeleton() inserts 7 skeleton rows', () => {
    section.showSkeleton()
    const skeletons = el.querySelectorAll('.forecast-day.skeleton')
    expect(skeletons.length).toBe(7)
  })

  it('showError() inserts content containing the error message', () => {
    section.showError('Failed to load', () => {})
    expect(el.innerHTML).toContain('Failed to load')
  })

  it('showError() retry button click calls onRetry', () => {
    const onRetry = vi.fn()
    section.showError('Failed to load', onRetry)
    const btn = el.querySelector('.retry-btn')
    expect(btn).not.toBeNull()
    btn.click()
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('render() after showSkeleton() replaces skeleton content', () => {
    section.showSkeleton()
    const skeletonsBefore = el.querySelectorAll('.forecast-day.skeleton').length
    expect(skeletonsBefore).toBe(7)

    section.render(STATIC_DAILY, 'imperial')

    const skeletonsAfter = el.querySelectorAll('.forecast-day.skeleton').length
    expect(skeletonsAfter).toBe(0)

    const days = el.querySelectorAll('.forecast-day')
    expect(days.length).toBe(7)
  })
})
