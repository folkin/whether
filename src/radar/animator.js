// Radar Animator (Piece 11b)
// Pure frame-loop and scrubber state machine. No Leaflet, no DOM access.
// The caller is responsible for actually swapping tile layers on each frame change.

const FRAME_INTERVAL_MS = 500

/**
 * Create an animator that cycles through frame indices.
 *
 * @param {object} options
 * @param {Array<unknown>} options.frames        - Frame array (only .length is used here).
 * @param {(index: number) => void} options.onFrameChange - Called synchronously on every
 *   frame change, including seek(). Receives the new 0-based index.
 *
 * @returns {{
 *   play(): void,
 *   pause(): void,
 *   seek(index: number): void,
 *   getCurrentIndex(): number,
 *   isPlaying(): boolean,
 *   destroy(): void,
 * }}
 */
export function createAnimator({ frames, onFrameChange }) {
  let currentIndex = 0
  let intervalId = null

  function tick() {
    currentIndex = (currentIndex + 1) % frames.length
    onFrameChange(currentIndex)
  }

  function play() {
    if (intervalId !== null) return // already playing
    onFrameChange(currentIndex) // render current frame immediately on resume
    intervalId = setInterval(tick, FRAME_INTERVAL_MS)
  }

  function pause() {
    if (intervalId === null) return
    clearInterval(intervalId)
    intervalId = null
  }

  function seek(index) {
    const clamped = Math.max(0, Math.min(frames.length - 1, index))
    currentIndex = clamped
    onFrameChange(currentIndex)
  }

  function getCurrentIndex() {
    return currentIndex
  }

  function isPlaying() {
    return intervalId !== null
  }

  function destroy() {
    pause()
  }

  return { play, pause, seek, getCurrentIndex, isPlaying, destroy }
}
