// Geo (Piece 3)
// Wraps navigator.geolocation. Requests position on demand only — never on load
// without an explicit user gesture. Writes the result to Storage and dispatches
// window events so the App Shell can react to coordinate changes.
// Depends on: storage.js (setLocation), config.js (import pattern)

import { setLocation } from './storage.js'

// GeolocationPositionError codes (mirrored here for reference):
//   1 = PERMISSION_DENIED
//   2 = POSITION_UNAVAILABLE
//   3 = TIMEOUT

const GEO_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 0,
}

export function requestLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        setLocation(lat, lon)

        window.dispatchEvent(
          new CustomEvent('geo:locationUpdated', { detail: { lat, lon } }),
        )

        resolve({ lat, lon })
      },
      (err) => {
        const error = { code: err.code, message: err.message }

        window.dispatchEvent(
          new CustomEvent('geo:locationError', { detail: error }),
        )

        reject(error)
      },
      GEO_OPTIONS,
    )
  })
}
