// Radar Manifest (Piece 11a)
// Fetches the RainViewer weather-maps manifest and returns a flat array of
// { path: string, time: number } frame descriptors.
// No Leaflet. No caching — the service worker handles that via radarManifest cache.

import { API } from '../config.js'

/**
 * Fetch the RainViewer manifest and return an ordered array of radar frames.
 * Frames from radar.past come first (oldest → newest), followed by any
 * radar.nowcast frames when present.
 *
 * @returns {Promise<Array<{ path: string, time: number }>>}
 * @throws {Error} when the network request fails or the response is not ok.
 */
export async function getFrames() {
  const res = await fetch(API.rainViewer.manifest)
  if (!res.ok) {
    throw new Error(`RainViewer manifest fetch failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  const past = Array.isArray(data?.radar?.past) ? data.radar.past : []
  const nowcast = Array.isArray(data?.radar?.nowcast) ? data.radar.nowcast : []

  const frames = [...past, ...nowcast].map((frame) => ({
    path: frame.path,
    time: frame.time,
  }))

  if (frames.length === 0) {
    throw new Error('RainViewer manifest contained no radar frames')
  }

  return frames
}
