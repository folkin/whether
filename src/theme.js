// Theme (Piece 4)
// Resolves and applies light/dark theme. Sets data-theme on <html>.
// Listens to prefers-color-scheme for system mode.
// Dispatches 'theme:changed' on window with detail: { resolved: 'light' | 'dark' }
// Depends on: storage.js

import { getTheme, setTheme } from './storage.js'

let resolvedTheme = 'light'
let systemMediaQuery = null
let systemChangeHandler = null

function resolveSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved) {
  resolvedTheme = resolved
  document.documentElement.setAttribute('data-theme', resolved)
  window.dispatchEvent(new CustomEvent('theme:changed', { detail: { resolved } }))
}

function onSystemChange(e) {
  const resolved = e.matches ? 'dark' : 'light'
  applyTheme(resolved)
}

export function initTheme() {
  // Remove any previous system listener
  if (systemMediaQuery && systemChangeHandler) {
    systemMediaQuery.removeEventListener('change', systemChangeHandler)
    systemMediaQuery = null
    systemChangeHandler = null
  }

  const stored = getTheme()

  if (stored === 'system') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const resolved = mq.matches ? 'dark' : 'light'
    resolvedTheme = resolved
    document.documentElement.setAttribute('data-theme', resolved)

    // Track system changes while stored theme is 'system'
    systemMediaQuery = mq
    systemChangeHandler = onSystemChange
    mq.addEventListener('change', systemChangeHandler)
  } else {
    resolvedTheme = stored // 'light' or 'dark'
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }
}

export function toggleTheme() {
  const next = resolvedTheme === 'light' ? 'dark' : 'light'

  // Remove system listener since we're now pinning to an explicit theme
  if (systemMediaQuery && systemChangeHandler) {
    systemMediaQuery.removeEventListener('change', systemChangeHandler)
    systemMediaQuery = null
    systemChangeHandler = null
  }

  setTheme(next)
  applyTheme(next)
}

export function getResolvedTheme() {
  return resolvedTheme
}
