// Icon Resolver (Piece 7)
// Maps WMO weather codes + isDay flag to inline SVG strings.
// Uses Lucide icons via Vite ?raw imports.
// Applies var(--vscode-charts-*) color on root <svg> element via style="color: var(--vscode-charts-*)".
// Internal strokes use currentColor and inherit from the root color.
// isDay affects icon shape (day/night variants) only — not color.
// Depends on: nothing (SVGs bundled at build time)

// TODO: implement

export function getWeatherIcon(code, isDay, opts = {}) {
  return ''
}

export function getWeatherLabel(code) {
  return ''
}
