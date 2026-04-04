import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock matchMedia before any module import so the module sees the mock.
// We'll control `matches` per test by reassigning window.matchMedia.
function setupMatchMedia(prefersDark = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: prefersDark,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

// Helper: dynamically import theme module fresh each test
async function loadTheme() {
  const mod = await import('../src/theme.js')
  return mod
}

describe('Theme', () => {
  beforeEach(() => {
    // Reset modules so module-level state (resolvedTheme) is fresh
    vi.resetModules()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // Default: system preference is light
    setupMatchMedia(false)
  })

  it('initTheme() sets data-theme on document.documentElement', async () => {
    const { initTheme } = await loadTheme()
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()
  })

  it('getResolvedTheme() returns "light" after initTheme() with no stored theme (system defaults to light)', async () => {
    setupMatchMedia(false)
    const { initTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(getResolvedTheme()).toBe('light')
  })

  it('getResolvedTheme() returns "dark" after initTheme() when system preference is dark', async () => {
    setupMatchMedia(true)
    const { initTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(getResolvedTheme()).toBe('dark')
  })

  it('initTheme() with stored "light" sets data-theme="light" regardless of system preference', async () => {
    setupMatchMedia(true) // system says dark
    localStorage.setItem('weather:theme', 'light')
    const { initTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(getResolvedTheme()).toBe('light')
  })

  it('initTheme() with stored "dark" sets data-theme="dark"', async () => {
    setupMatchMedia(false) // system says light
    localStorage.setItem('weather:theme', 'dark')
    const { initTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(getResolvedTheme()).toBe('dark')
  })

  it('toggleTheme() switches from light to dark', async () => {
    localStorage.setItem('weather:theme', 'light')
    const { initTheme, toggleTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(getResolvedTheme()).toBe('light')

    toggleTheme()
    expect(getResolvedTheme()).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('toggleTheme() switches from dark to light', async () => {
    localStorage.setItem('weather:theme', 'dark')
    const { initTheme, toggleTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(getResolvedTheme()).toBe('dark')

    toggleTheme()
    expect(getResolvedTheme()).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('toggleTheme() dispatches theme:changed event with correct detail.resolved', async () => {
    localStorage.setItem('weather:theme', 'light')
    const { initTheme, toggleTheme } = await loadTheme()
    initTheme()

    const events = []
    window.addEventListener('theme:changed', e => events.push(e))

    toggleTheme()

    expect(events).toHaveLength(1)
    expect(events[0].detail.resolved).toBe('dark')
  })

  it('toggleTheme() twice returns to original theme', async () => {
    localStorage.setItem('weather:theme', 'light')
    const { initTheme, toggleTheme, getResolvedTheme } = await loadTheme()
    initTheme()

    toggleTheme()
    expect(getResolvedTheme()).toBe('dark')

    toggleTheme()
    expect(getResolvedTheme()).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('system theme changes fire theme:changed when stored theme is "system"', async () => {
    // Stored as system (default), system is light initially
    setupMatchMedia(false)
    let changeHandler = null
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') changeHandler = handler
        }),
        removeEventListener: vi.fn(),
      })),
    })

    const { initTheme, getResolvedTheme } = await loadTheme()
    initTheme()
    expect(getResolvedTheme()).toBe('light')

    const events = []
    window.addEventListener('theme:changed', e => events.push(e))

    // Simulate system switching to dark
    changeHandler({ matches: true })

    expect(getResolvedTheme()).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(events).toHaveLength(1)
    expect(events[0].detail.resolved).toBe('dark')
  })
})
