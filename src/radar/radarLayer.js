// Radar Layer (Piece 11c)
// All Leaflet usage is isolated here. Leaflet is loaded on-demand via dynamic
// import so that the rest of the app never statically depends on it.

import { API } from '../config.js'

const LEAFLET_ESM = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js'
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

/** Inject the Leaflet stylesheet once. Safe to call multiple times. */
function ensureLeafletCSS() {
  if (document.querySelector(`link[href="${LEAFLET_CSS}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = LEAFLET_CSS
  document.head.appendChild(link)
}

/** Lazily load Leaflet and return the L global. Cached after first call. */
let _L = null
async function loadLeaflet() {
  if (_L) return _L
  ensureLeafletCSS()
  const mod = await import(/* @vite-ignore */ LEAFLET_ESM)
  _L = mod.default ?? mod
  return _L
}

/**
 * Build a CartoDB base tile layer for the given theme.
 *
 * @param {object} L - Leaflet instance
 * @param {'light'|'dark'} theme
 * @returns {L.TileLayer}
 */
function buildBaseLayer(L, theme) {
  const url = API.cartoDB[theme] ?? API.cartoDB.light
  return L.tileLayer(url, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  })
}

/**
 * Initialize a Leaflet map inside `el`, centered at lat/lon.
 * Adds the CartoDB base tile layer appropriate for the current theme.
 *
 * @param {HTMLElement} el
 * @param {{ lat: number, lon: number, theme: 'light'|'dark' }} options
 * @returns {Promise<{ L: object, map: L.Map, baseLayer: L.TileLayer }>}
 */
export async function createMap(el, { lat, lon, theme }) {
  const L = await loadLeaflet()

  const map = L.map(el, {
    center: [lat, lon],
    zoom: 6,
    minZoom: 3,
    maxZoom: 12,
    zoomControl: true,
  })

  const baseLayer = buildBaseLayer(L, theme)
  baseLayer.addTo(map)

  return { L, map, baseLayer }
}

/**
 * Create a RainViewer radar tile layer for a given manifest path.
 * Returns a custom L.GridLayer whose tiles are drawn onto <canvas> elements,
 * allowing client-side palette remapping via a pixel lookup table.
 *
 * Tiles are always fetched as Universal Blue (color=2) — the API ignores the
 * color parameter on free/keyless requests. Client-side remapping handles
 * palette switching without additional network requests.
 *
 * @param {object} L                   - Leaflet instance
 * @param {string} path                - Frame path from the RainViewer manifest
 * @param {Map<number, number[]>|null} remapTable
 *   Pixel remap lookup built by buildRemap(). Pass null for the default
 *   palette (Universal Blue rendered as-is, no pixel walk needed).
 * @returns {L.GridLayer}
 */
export function createRadarTileLayer(L, path, remapTable) {
  const RadarLayer = L.GridLayer.extend({
    createTile(coords, done) {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        if (remapTable) {
          const imageData = ctx.getImageData(0, 0, 256, 256)
          const px = imageData.data
          for (let i = 0; i < px.length; i += 4) {
            const key = (((px[i] << 24) | (px[i + 1] << 16) | (px[i + 2] << 8) | px[i + 3]) >>> 0)
            const mapped = remapTable.get(key)
            if (mapped) {
              px[i]     = mapped[0]
              px[i + 1] = mapped[1]
              px[i + 2] = mapped[2]
              px[i + 3] = mapped[3]
            }
          }
          ctx.putImageData(imageData, 0, 0)
        }
        done(null, canvas)
      }
      img.onerror = (e) => done(e, canvas)
      img.src = `https://tilecache.rainviewer.com${path}/256/${coords.z}/${coords.x}/${coords.y}/2/1_1.png`
      return canvas
    },
  })

  return new RadarLayer({
    opacity: 0.6,
    zIndex: 10,
    tileSize: 256,
    maxNativeZoom: 7,
  })
}

/**
 * Swap the CartoDB base tile layer when the theme changes.
 * Removes `oldLayer` from the map, creates a new layer for `theme`, adds it,
 * and returns the new layer so the caller can track it.
 *
 * @param {L.Map} map
 * @param {L.TileLayer} oldLayer
 * @param {'light'|'dark'} theme
 * @returns {L.TileLayer} the newly added base layer
 */
export function swapBaseLayer(map, oldLayer, theme) {
  if (oldLayer) map.removeLayer(oldLayer)
  // _L is guaranteed to be loaded at this point because createMap was called first.
  const newLayer = buildBaseLayer(_L, theme)
  newLayer.addTo(map)
  // Bring the new base layer below any radar layers already on the map
  newLayer.setZIndex(1)
  return newLayer
}
