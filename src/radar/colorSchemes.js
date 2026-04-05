// Radar Color Schemes (Piece 11e)
// Universal Blue LUT + remap builder. Adding a new palette = add an entry to
// PALETTES and an <option> to the select in index.js.
//
// LUT format: 128 entries, index 0 = dBZ -32, index 127 = dBZ 95. [r, g, b, a].
// Source: https://www.rainviewer.com/api/color-schemes.html

// prettier-ignore
const UNIVERSAL_BLUE = [
  // dBZ -32 to -11 (indices 0–21): fully transparent
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  // dBZ -10 to 14 (indices 22–46): semi-transparent neutral
  [99,97,89,20],[102,99,90,25],[105,102,92,30],[108,104,93,36],
  [111,107,95,41],[114,110,97,46],[117,112,98,52],[120,115,100,57],
  [124,117,101,62],[127,120,103,68],[130,123,105,73],[133,125,106,78],
  [136,128,108,84],[139,130,109,89],[142,133,111,94],[146,136,113,100],
  [158,147,117,110],[170,158,121,120],[182,169,126,130],[194,180,130,140],
  [206,192,135,150],[210,196,139,160],[214,200,143,170],[218,204,147,180],
  [222,208,151,190],
  // dBZ 15–34 (indices 47–66): blue gradient
  [136,221,238,255],[108,209,235,255],[81,197,232,255],[54,186,229,255],
  [27,174,226,255],[0,163,224,255],[0,154,213,255],[0,145,202,255],
  [0,136,191,255],[0,127,180,255],[0,119,170,255],[0,112,163,255],
  [0,105,156,255],[0,98,149,255],[0,91,142,255],[0,85,136,255],
  [0,81,128,255],[0,78,120,255],[0,74,112,255],[0,71,104,255],
  // dBZ 35–54 (indices 67–86): yellow → orange → red
  [255,238,0,255],[255,224,0,255],[255,210,0,255],[255,197,0,255],
  [255,183,0,255],[255,170,0,255],[255,159,0,255],[255,149,0,255],
  [255,139,0,255],[255,129,0,255],[255,68,0,255],[242,54,0,255],
  [230,40,0,255],[217,27,0,255],[205,13,0,255],[193,0,0,255],
  [168,0,0,255],[143,0,0,255],[118,0,0,255],[93,0,0,255],
  // dBZ 55–64 (indices 87–96): pink/magenta
  [255,170,255,255],[255,159,255,255],[255,149,255,255],[255,139,255,255],
  [255,129,255,255],[255,119,255,255],[255,108,255,255],[255,98,255,255],
  [255,88,255,255],[255,78,255,255],
  // dBZ 65–74 (indices 97–106): white
  [255,255,255,255],[255,255,255,255],[255,255,255,255],[255,255,255,255],
  [255,255,255,255],[255,255,255,255],[255,255,255,255],[255,255,255,255],
  [255,255,255,255],[255,255,255,255],
  // dBZ 75–95 (indices 107–127): bright green
  [0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],
  [0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],
  [0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],
  [0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],[0,255,0,255],
  [0,255,0,255],
]

/**
 * Build a pixel-level reverse lookup from a source LUT to a destination LUT.
 * Skips fully transparent entries (alpha = 0) — those pixels are left as-is.
 *
 * @param {number[][]} srcLut - 128-entry source LUT ([r,g,b,a] per entry)
 * @param {number[][]} dstLut - 128-entry destination LUT
 * @returns {Map<number, number[]>} packed uint32 RGBA key → destination [r,g,b,a]
 */
export function buildRemap(srcLut, dstLut) {
  const map = new Map()
  for (let i = 0; i < srcLut.length; i++) {
    const [sr, sg, sb, sa] = srcLut[i]
    if (sa === 0) continue
    const key = (((sr << 24) | (sg << 16) | (sb << 8) | sa) >>> 0)
    map.set(key, dstLut[i])
  }
  return map
}

// prettier-ignore
const NWS_CLASSIC = [
  // dBZ -32 to 4 (indices 0–36): transparent — no echo
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],
  // dBZ 5–14 (indices 37–46): light green, ramping in
  [0,190,0,200],[0,195,0,210],[0,200,0,220],[0,205,0,230],[0,215,0,245],
  [0,220,0,255],[0,200,0,255],[0,180,0,255],[0,160,0,255],[0,140,0,255],
  // dBZ 15–24 (indices 47–56): medium/dark green
  [0,120,0,255],[0,110,0,255],[0,100,0,255],[10,105,0,255],[30,115,0,255],
  [60,130,0,255],[90,150,0,255],[120,165,0,255],[150,175,0,255],[185,190,0,255],
  // dBZ 25–34 (indices 57–66): yellow-green to yellow
  [210,210,0,255],[230,225,0,255],[245,240,0,255],[255,248,0,255],[255,240,0,255],
  [255,230,0,255],[255,218,0,255],[255,205,0,255],[255,192,0,255],[255,178,0,255],
  // dBZ 35–44 (indices 67–76): yellow-orange to orange-red
  [255,160,0,255],[255,140,0,255],[255,118,0,255],[255,94,0,255],[255,68,0,255],
  [255,40,0,255],[255,20,0,255],[255,0,0,255],[240,0,0,255],[220,0,0,255],
  // dBZ 45–54 (indices 77–86): red to dark red, transitioning to magenta
  [200,0,0,255],[180,0,0,255],[160,0,0,255],[140,0,0,255],[120,0,0,255],
  [100,0,0,255],[140,0,130,255],[175,0,175,255],[210,0,210,255],[240,0,240,255],
  // dBZ 55–64 (indices 87–96): magenta/pink
  [255,0,255,255],[255,40,255,255],[255,80,255,255],[255,110,255,255],[255,135,255,255],
  [255,155,255,255],[255,175,255,255],[255,195,255,255],[255,215,255,255],[255,235,255,255],
  // dBZ 65–74 (indices 97–106): white
  [255,255,255,255],[255,255,255,255],[255,255,255,255],[255,255,255,255],[255,255,255,255],
  [255,255,255,255],[255,255,255,255],[255,255,255,255],[255,255,255,255],[255,255,255,255],
  // dBZ 75–95 (indices 107–127): vivid purple (extreme/hail)
  [160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],
  [160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],
  [160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],
  [160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],[160,0,255,255],
  [160,0,255,255],
]

// Smooth grayscale: light gray (low reflectivity) → dark gray (heavy rain)
const GRAYSCALE = (() => {
  const lut = []
  for (let i = 0; i < 128; i++) {
    if (i < 37) { lut.push([0, 0, 0, 0]); continue }
    const t = (i - 37) / 90             // 0 → 1
    const v = Math.round(210 - t * 180) // 210 → 30
    const a = Math.round(180 + t * 75)  // 180 → 255
    lut.push([v, v, v, a])
  }
  return lut
})()

/**
 * Build a gradient LUT from a set of color stops.
 * Stops: [[t, r, g, b, a], ...] where t is 0..1 across the visible dBZ range.
 * Indices 0–36 (dBZ < 5) are always transparent.
 */
function gradientLut(stops) {
  const lut = []
  for (let i = 0; i < 128; i++) {
    if (i < 37) { lut.push([0, 0, 0, 0]); continue }
    const t = (i - 37) / 90
    let lo = stops[0], hi = stops[stops.length - 1]
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) { lo = stops[s]; hi = stops[s + 1]; break }
    }
    const f = hi[0] === lo[0] ? 0 : (t - lo[0]) / (hi[0] - lo[0])
    lut.push([
      Math.round(lo[1] + f * (hi[1] - lo[1])),
      Math.round(lo[2] + f * (hi[2] - lo[2])),
      Math.round(lo[3] + f * (hi[3] - lo[3])),
      Math.round(lo[4] + f * (hi[4] - lo[4])),
    ])
  }
  return lut
}

// Green phosphor CRT — dim glow for light rain, full bloom for heavy
const RETRO = gradientLut([
  [0.00,   0,  30,   0, 160],
  [0.30,   0, 140,  10, 210],
  [0.60,   0, 220,  30, 240],
  [0.85,   0, 255,  70, 255],
  [1.00,  180, 255, 180, 255],
])

// Inferno — black → deep purple → crimson → orange → pale yellow
// Stops approximated from the matplotlib inferno colormap
const INFERNO = gradientLut([
  [0.000,   0,   0,   4, 255],
  [0.125,  50,  16, 125, 255],
  [0.250, 120,  28, 109, 255],
  [0.375, 176,  27,  66, 255],
  [0.500, 220,  56,  21, 255],
  [0.625, 247, 113,   1, 255],
  [0.750, 252, 176,  21, 255],
  [0.875, 252, 229,  95, 255],
  [1.000, 252, 255, 164, 255],
])

// Neon — electric cyan → green → yellow → hot pink → white
const NEON = gradientLut([
  [0.00,   0, 240, 255, 220],
  [0.20,   0, 255, 100, 255],
  [0.40, 200, 255,   0, 255],
  [0.55, 255, 255,   0, 255],
  [0.70, 255,  20, 180, 255],
  [0.85, 255,   0, 255, 255],
  [1.00, 255, 255, 255, 255],
])

// Colorblind-safe — blue axis for light/moderate, orange axis for heavy
// Avoids the red/green axis that affects ~8% of men (deuteranopia/protanopia)
const COLORBLIND = gradientLut([
  [0.00, 173, 216, 230, 200],
  [0.20,  30, 144, 255, 255],
  [0.40,   0,  80, 200, 255],
  [0.55, 255, 200,   0, 255],
  [0.70, 255, 127,   0, 255],
  [0.85, 200,  60,   0, 255],
  [1.00, 255, 255, 255, 255],
])

// Viridis — perceptually uniform dark purple → teal → green → yellow
// Stops from the matplotlib viridis colormap
const VIRIDIS = gradientLut([
  [0.00,  68,   1,  84, 255],
  [0.14,  71,  44, 122, 255],
  [0.29,  59,  81, 139, 255],
  [0.43,  44, 113, 142, 255],
  [0.57,  33, 145, 140, 255],
  [0.71,  53, 183, 121, 255],
  [0.86, 181, 222,  43, 255],
  [1.00, 253, 231,  37, 255],
])

/**
 * Named palettes. Each value is a 128-entry LUT compatible with buildRemap.
 * Adding a new palette: add an entry here + an <option> in index.js.
 */
export const PALETTES = {
  default:    NWS_CLASSIC,
  blue:       UNIVERSAL_BLUE,
  gray:       GRAYSCALE,
  retro:      RETRO,
  inferno:    INFERNO,
  neon:       NEON,
  colorblind: COLORBLIND,
  viridis:    VIRIDIS,
}
