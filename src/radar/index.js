// Radar Module — Public Entry (Piece 11d)
// Wires manifest, animator, and radarLayer together.
// Leaflet is loaded lazily on the first open() call.
//
// Usage:
//   const radar = await initRadar(document.getElementById('panel-radar'))
//   await radar.open()   // lazy init, idempotent
//   radar.close()        // hide, keep map alive
//   radar.destroy()      // full teardown

import { getFrames } from './manifest.js'
import { createAnimator } from './animator.js'
import { createMap, createRadarTileLayer, swapBaseLayer } from './radarLayer.js'
import { getLocation } from '../storage.js'
import { getResolvedTheme } from '../theme.js'

const FALLBACK_LOCATION = { lat: 39.5, lon: -98.35 }

/**
 * Format a unix timestamp as "HH:MM" local time.
 * Falls back to "X min ago" for frames within the last 2 hours.
 *
 * @param {number} unixSeconds
 * @returns {string}
 */
function formatFrameTime(unixSeconds) {
  const d = new Date(unixSeconds * 1000)
  const now = Date.now()
  const diffMin = Math.round((now - d.getTime()) / 60_000)

  if (diffMin >= 0 && diffMin < 120) {
    if (diffMin === 0) return 'now'
    return `${diffMin} min ago`
  }

  // Future frames (nowcast) or old frames: show wall-clock time
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Inject animation controls HTML into the container element.
 *
 * @param {HTMLElement} container
 * @param {number} maxIndex  - frames.length - 1
 * @returns {{ playBtn: HTMLButtonElement, scrubber: HTMLInputElement, timeLabel: HTMLSpanElement }}
 */
function injectControls(container, maxIndex) {
  const controls = document.createElement('div')
  controls.className = 'radar-controls'
  controls.innerHTML = `
    <button class="radar-play-btn" aria-label="Play">&#9654;</button>
    <input
      class="radar-scrubber"
      type="range"
      min="0"
      max="${maxIndex}"
      value="0"
      step="1"
      aria-label="Radar frame"
    />
    <span class="radar-timestamp"></span>
  `
  container.appendChild(controls)

  return {
    playBtn: controls.querySelector('.radar-play-btn'),
    scrubber: controls.querySelector('.radar-scrubber'),
    timeLabel: controls.querySelector('.radar-timestamp'),
  }
}

/**
 * @param {HTMLElement} el  - The container element (e.g. #panel-radar).
 * @returns {Promise<{ open(): Promise<void>, close(): void, destroy(): void }>}
 */
export async function initRadar(el) {
  // Make sure the container is a positioned ancestor for the absolute controls overlay
  el.style.position = 'relative'

  // ── Internal state ─────────────────────────────────────────────────────────
  let initialized = false
  let mapInstance = null        // L.Map
  let leaflet = null            // L instance (stored after createMap resolves)
  let baseLayer = null          // current CartoDB tile layer
  let radarLayers = []          // L.TileLayer[], one per frame
  let animator = null
  let frames = []
  let activeRadarLayer = null   // the layer currently on the map
  let controls = null           // { playBtn, scrubber, timeLabel }

  // ── Theme listener ─────────────────────────────────────────────────────────
  function onThemeChanged(e) {
    if (!mapInstance || !baseLayer) return
    baseLayer = swapBaseLayer(mapInstance, baseLayer, e.detail.resolved)
  }

  // ── Frame change handler ───────────────────────────────────────────────────
  function onFrameChange(index) {
    // Swap radar tile layers
    if (activeRadarLayer) {
      mapInstance.removeLayer(activeRadarLayer)
    }
    activeRadarLayer = radarLayers[index]
    activeRadarLayer.addTo(mapInstance)

    // Update controls
    if (controls) {
      controls.scrubber.value = String(index)
      controls.timeLabel.textContent = formatFrameTime(frames[index].time)
    }
  }

  // ── open() ─────────────────────────────────────────────────────────────────
  async function open() {
    // Show the element regardless
    el.style.display = ''

    if (initialized) return
    initialized = true

    // 1. Fetch manifest frames
    frames = await getFrames()

    // 2. Determine map center
    const loc = getLocation() ?? FALLBACK_LOCATION

    // 3. Create Leaflet map (also loads Leaflet + CSS)
    const result = await createMap(el, {
      lat: loc.lat,
      lon: loc.lon,
      theme: getResolvedTheme(),
    })
    leaflet = result.L
    mapInstance = result.map
    baseLayer = result.baseLayer

    // 4. Pre-build all radar tile layers (not added to map yet)
    radarLayers = frames.map((frame) => createRadarTileLayer(leaflet, frame.path))

    // 5. Show the first frame immediately
    activeRadarLayer = radarLayers[0]
    activeRadarLayer.addTo(mapInstance)

    // 6. Inject controls
    controls = injectControls(el, frames.length - 1)
    controls.timeLabel.textContent = formatFrameTime(frames[0].time)

    // 7. Create animator
    animator = createAnimator({ frames, onFrameChange })

    // 8. Wire play/pause button
    controls.playBtn.addEventListener('click', () => {
      if (animator.isPlaying()) {
        animator.pause()
        controls.playBtn.setAttribute('aria-label', 'Play')
        controls.playBtn.innerHTML = '&#9654;'
      } else {
        animator.play()
        controls.playBtn.setAttribute('aria-label', 'Pause')
        controls.playBtn.innerHTML = '&#9646;&#9646;'
      }
    })

    // 9. Wire scrubber — scrubbing auto-pauses
    controls.scrubber.addEventListener('input', (e) => {
      const index = parseInt(e.target.value, 10)
      animator.pause()
      controls.playBtn.setAttribute('aria-label', 'Play')
      controls.playBtn.innerHTML = '&#9654;'
      animator.seek(index)
    })

    // 10. Subscribe to theme changes
    window.addEventListener('theme:changed', onThemeChanged)
  }

  // ── close() ────────────────────────────────────────────────────────────────
  function close() {
    el.style.display = 'none'
    if (animator && animator.isPlaying()) {
      animator.pause()
      if (controls) {
        controls.playBtn.setAttribute('aria-label', 'Play')
        controls.playBtn.innerHTML = '&#9654;'
      }
    }
  }

  // ── destroy() ──────────────────────────────────────────────────────────────
  function destroy() {
    window.removeEventListener('theme:changed', onThemeChanged)
    if (animator) {
      animator.destroy()
      animator = null
    }
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }
    baseLayer = null
    radarLayers = []
    activeRadarLayer = null
    controls = null
    frames = []
    initialized = false
  }

  return { open, close, destroy }
}
