---
name: Radar Color Schemes
description: RainViewer color scheme situation — API limitation, canvas remap approach, and what's needed to implement
type: project
---

# Radar Color Schemes

## API Limitation

The free/keyless RainViewer tile API ignores the `{color}` parameter in the tile URL and always returns **Universal Blue (scheme #2)** tiles. Confirmed via identical `ETag` and `Content-Length` headers across requests for colors 0, 2, and 6 against the same tile coordinates.

The color dropdown in the UI is currently wired up but has no effect at the server level. The dropdown has been left with a single "Default" option as a placeholder.

## Client-Side Remap Approach

RainViewer publishes the full RGBA lookup table for each color scheme at:
- Docs: https://www.rainviewer.com/api/color-schemes.html
- CSV: https://www.rainviewer.com/files/rainviewer_api_colors_table.csv

The table maps **dBZ values (-32 to 95, 128 entries)** to RGBA hex colors (`#RRGGBBAA` format) for each scheme. Universal Blue data is fully captured below.

The remap pipeline:
1. Fetch tile as usual (always returns Universal Blue)
2. In a custom Leaflet `GridLayer`, `createTile()` returns a `<canvas>` instead of `<img>`
3. Load the source image with `crossOrigin = 'anonymous'` (RainViewer sends `Access-Control-Allow-Origin: *`)
4. Draw to canvas, call `getImageData()`, walk the pixel buffer
5. For each pixel, look up its RGBA value in a pre-built reverse map (Universal Blue pixel → target palette pixel)
6. `putImageData()` back — done

The source image only needs to be fetched/cached once; remapping is applied on render. Palette switching rebuilds the Leaflet layer with a different remap table — same tile cache, different visual.

## Universal Blue LUT

128 entries, index 0 = dBZ -32, index 127 = dBZ 95. Format: `[r, g, b, a]`.

```
dBZ -32 to -11 (indices 0–21): [0,0,0,0]  (fully transparent, 22 entries)
dBZ -10 [22]: [99,97,89,20]
dBZ -9  [23]: [102,99,90,25]
dBZ -8  [24]: [105,102,92,30]
dBZ -7  [25]: [108,104,93,36]
dBZ -6  [26]: [111,107,95,41]
dBZ -5  [27]: [114,110,97,46]
dBZ -4  [28]: [117,112,98,52]
dBZ -3  [29]: [120,115,100,57]
dBZ -2  [30]: [124,117,101,62]
dBZ -1  [31]: [127,120,103,68]
dBZ  0  [32]: [130,123,105,73]
dBZ  1  [33]: [133,125,106,78]
dBZ  2  [34]: [136,128,108,84]
dBZ  3  [35]: [139,130,109,89]
dBZ  4  [36]: [142,133,111,94]
dBZ  5  [37]: [146,136,113,100]
dBZ  6  [38]: [158,147,117,110]
dBZ  7  [39]: [170,158,121,120]
dBZ  8  [40]: [182,169,126,130]
dBZ  9  [41]: [194,180,130,140]
dBZ 10  [42]: [206,192,135,150]
dBZ 11  [43]: [210,196,139,160]
dBZ 12  [44]: [214,200,143,170]
dBZ 13  [45]: [218,204,147,180]
dBZ 14  [46]: [222,208,151,190]
dBZ 15  [47]: [136,221,238,255]
dBZ 16  [48]: [108,209,235,255]
dBZ 17  [49]: [81,197,232,255]
dBZ 18  [50]: [54,186,229,255]
dBZ 19  [51]: [27,174,226,255]
dBZ 20  [52]: [0,163,224,255]
dBZ 21  [53]: [0,154,213,255]
dBZ 22  [54]: [0,145,202,255]
dBZ 23  [55]: [0,136,191,255]
dBZ 24  [56]: [0,127,180,255]
dBZ 25  [57]: [0,119,170,255]
dBZ 26  [58]: [0,112,163,255]
dBZ 27  [59]: [0,105,156,255]
dBZ 28  [60]: [0,98,149,255]
dBZ 29  [61]: [0,91,142,255]
dBZ 30  [62]: [0,85,136,255]
dBZ 31  [63]: [0,81,128,255]
dBZ 32  [64]: [0,78,120,255]
dBZ 33  [65]: [0,74,112,255]
dBZ 34  [66]: [0,71,104,255]
dBZ 35  [67]: [255,238,0,255]
dBZ 36  [68]: [255,224,0,255]
dBZ 37  [69]: [255,210,0,255]
dBZ 38  [70]: [255,197,0,255]
dBZ 39  [71]: [255,183,0,255]
dBZ 40  [72]: [255,170,0,255]
dBZ 41  [73]: [255,159,0,255]
dBZ 42  [74]: [255,149,0,255]
dBZ 43  [75]: [255,139,0,255]
dBZ 44  [76]: [255,129,0,255]
dBZ 45  [77]: [255,68,0,255]
dBZ 46  [78]: [242,54,0,255]
dBZ 47  [79]: [230,40,0,255]
dBZ 48  [80]: [217,27,0,255]
dBZ 49  [81]: [205,13,0,255]
dBZ 50  [82]: [193,0,0,255]
dBZ 51  [83]: [168,0,0,255]
dBZ 52  [84]: [143,0,0,255]
dBZ 53  [85]: [118,0,0,255]
dBZ 54  [86]: [93,0,0,255]
dBZ 55  [87]: [255,170,255,255]
dBZ 56  [88]: [255,159,255,255]
dBZ 57  [89]: [255,149,255,255]
dBZ 58  [90]: [255,139,255,255]
dBZ 59  [91]: [255,129,255,255]
dBZ 60  [92]: [255,119,255,255]
dBZ 61  [93]: [255,108,255,255]
dBZ 62  [94]: [255,98,255,255]
dBZ 63  [95]: [255,88,255,255]
dBZ 64  [96]: [255,78,255,255]
dBZ 65–74 [97–106]: [255,255,255,255]  (white, 10 entries)
dBZ 75–95 [107–127]: [0,255,0,255]     (bright green, 21 entries)
```

## What's Left to Build

1. **`src/radar/colorSchemes.js`** — new file: Universal Blue LUT as a typed array, `PALETTES` export keyed by name, `buildRemap(srcLut, dstLut)` that produces a `Map<uint32, [r,g,b,a]>` for pixel-level lookup
2. **`src/radar/radarLayer.js`** — `createRadarTileLayer` returns a custom `L.GridLayer` subclass whose `createTile` loads the source tile, draws to canvas, applies remap, returns the canvas element
3. **`src/radar/index.js`** — pass palette (not color number) to `createRadarTileLayer`; rebuild layers on palette change
4. **`src/style.css`** — no changes needed

Adding a new palette later = add an entry to `PALETTES` in `colorSchemes.js` and add an `<option>` to the select.
