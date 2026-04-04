// Units Formatter (Piece 8)
// Pure functions. Converts raw API numbers to display strings with correct labels.
// No dependencies.

export function formatTemp(v, units) {
  const rounded = Math.round(v)
  return units === 'imperial' ? `${rounded}°F` : `${rounded}°C`
}

export function formatWind(v, units) {
  const rounded = Math.round(v)
  return units === 'imperial' ? `${rounded} mph` : `${rounded} km/h`
}

export function formatPrecip(v, units) {
  const fixed = v.toFixed(1)
  return units === 'imperial' ? `${fixed} in` : `${fixed} mm`
}

export function formatPercent(v) {
  return `${Math.round(v)}%`
}

export function formatDate(iso) {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(iso) {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatRelativeTime(epochMs) {
  const diffMs = Date.now() - epochMs
  const diffSec = diffMs / 1000
  const diffMin = diffSec / 60
  const diffHr = diffMin / 60
  const diffDay = diffHr / 24

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) {
    const m = Math.floor(diffMin)
    return `${m} ${m === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffHr < 24) {
    const h = Math.floor(diffHr)
    return `${h} ${h === 1 ? 'hour' : 'hours'} ago`
  }
  const d = Math.floor(diffDay)
  return `${d} ${d === 1 ? 'day' : 'days'} ago`
}
