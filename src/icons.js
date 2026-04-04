// Icon Resolver (Piece 7)
// Maps WMO weather codes + isDay flag to inline SVG strings.
// Uses Lucide icon node data directly (no ?raw imports needed).
// Applies color on root <svg> element via style="color: ...".
// Internal strokes use currentColor and inherit from the root color.

// Lucide icon data — each entry is an array of [tag, attrs] tuples.
// Sourced directly from node_modules/lucide/dist/esm/icons/*.js

const Sun = [
  ["circle", { cx: "12", cy: "12", r: "4" }],
  ["path", { d: "M12 2v2" }],
  ["path", { d: "M12 20v2" }],
  ["path", { d: "m4.93 4.93 1.41 1.41" }],
  ["path", { d: "m17.66 17.66 1.41 1.41" }],
  ["path", { d: "M2 12h2" }],
  ["path", { d: "M20 12h2" }],
  ["path", { d: "m6.34 17.66-1.41 1.41" }],
  ["path", { d: "m19.07 4.93-1.41 1.41" }],
];

const Moon = [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]];

const Cloud = [["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" }]];

const CloudSun = [
  ["path", { d: "M12 2v2" }],
  ["path", { d: "m4.93 4.93 1.41 1.41" }],
  ["path", { d: "M20 12h2" }],
  ["path", { d: "m19.07 4.93-1.41 1.41" }],
  ["path", { d: "M15.947 12.65a4 4 0 0 0-5.925-4.128" }],
  ["path", { d: "M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" }],
];

const CloudMoon = [
  ["path", { d: "M10.188 8.5A6 6 0 0 1 16 4a1 1 0 0 0 6 6 6 6 0 0 1-3 5.197" }],
  ["path", { d: "M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6Z" }],
];

const CloudFog = [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }],
  ["path", { d: "M16 17H7" }],
  ["path", { d: "M17 21H9" }],
];

const CloudDrizzle = [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }],
  ["path", { d: "M8 19v1" }],
  ["path", { d: "M8 14v1" }],
  ["path", { d: "M16 19v1" }],
  ["path", { d: "M16 14v1" }],
  ["path", { d: "M12 21v1" }],
  ["path", { d: "M12 16v1" }],
];

const CloudRain = [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }],
  ["path", { d: "M16 14v6" }],
  ["path", { d: "M8 14v6" }],
  ["path", { d: "M12 16v6" }],
];

const CloudSnow = [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }],
  ["path", { d: "M8 15h.01" }],
  ["path", { d: "M8 19h.01" }],
  ["path", { d: "M12 17h.01" }],
  ["path", { d: "M12 21h.01" }],
  ["path", { d: "M16 15h.01" }],
  ["path", { d: "M16 19h.01" }],
];

const CloudLightning = [
  ["path", { d: "M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" }],
  ["path", { d: "m13 12-3 5h4l-3 5" }],
];

// Convert a attrs object to an HTML attribute string
function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
}

// Build a complete <svg>...</svg> string from Lucide icon node data
function lucideToSvg(iconData, size, colorStyle, className) {
  const classAttr = className ? ` class="${className}"` : "";
  const children = iconData
    .map(([tag, attrs]) => `<${tag} ${attrsToString(attrs)}/>`)
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg"` +
    ` width="${size}" height="${size}"` +
    ` viewBox="0 0 24 24"` +
    ` fill="none"` +
    ` stroke="currentColor"` +
    ` stroke-width="2"` +
    ` stroke-linecap="round"` +
    ` stroke-linejoin="round"` +
    ` style="${colorStyle}"` +
    `${classAttr}>${children}</svg>`
  );
}

// WMO code → { iconDay, iconNight, colorStyle }
// colorStyle is the full CSS value for the style attribute
const CODE_MAP = {
  0:  { day: Sun,            night: Moon,         color: "color: var(--vscode-charts-yellow)" },
  1:  { day: Sun,            night: Moon,         color: "color: var(--vscode-charts-yellow)" },
  2:  { day: CloudSun,       night: CloudMoon,    color: "color: var(--vscode-charts-blue)" },
  3:  { day: Cloud,          night: Cloud,        color: "color: var(--vscode-charts-blue)" },
  45: { day: CloudFog,       night: CloudFog,     color: "color: var(--fg-muted)" },
  48: { day: CloudFog,       night: CloudFog,     color: "color: var(--fg-muted)" },
  51: { day: CloudDrizzle,   night: CloudDrizzle, color: "color: var(--vscode-charts-blue)" },
  53: { day: CloudDrizzle,   night: CloudDrizzle, color: "color: var(--vscode-charts-blue)" },
  55: { day: CloudDrizzle,   night: CloudDrizzle, color: "color: var(--vscode-charts-blue)" },
  56: { day: CloudDrizzle,   night: CloudDrizzle, color: "color: var(--vscode-charts-blue)" },
  57: { day: CloudDrizzle,   night: CloudDrizzle, color: "color: var(--vscode-charts-blue)" },
  61: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  63: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  65: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  66: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  67: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  71: { day: CloudSnow,      night: CloudSnow,    color: "color: var(--vscode-charts-blue)" },
  73: { day: CloudSnow,      night: CloudSnow,    color: "color: var(--vscode-charts-blue)" },
  75: { day: CloudSnow,      night: CloudSnow,    color: "color: var(--vscode-charts-blue)" },
  77: { day: CloudSnow,      night: CloudSnow,    color: "color: var(--vscode-charts-blue)" },
  80: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  81: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  82: { day: CloudRain,      night: CloudRain,    color: "color: var(--vscode-charts-blue)" },
  85: { day: CloudSnow,      night: CloudSnow,    color: "color: var(--vscode-charts-blue)" },
  86: { day: CloudSnow,      night: CloudSnow,    color: "color: var(--vscode-charts-blue)" },
  95: { day: CloudLightning, night: CloudLightning, color: "color: var(--vscode-charts-red)" },
  96: { day: CloudLightning, night: CloudLightning, color: "color: var(--vscode-charts-red)" },
  99: { day: CloudLightning, night: CloudLightning, color: "color: var(--vscode-charts-red)" },
};

const LABELS = {
  0:  "Clear",
  1:  "Mostly Clear",
  2:  "Partly Cloudy",
  3:  "Cloudy",
  45: "Foggy",
  48: "Rime Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Light Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Light Freezing Rain",
  67: "Freezing Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Light Showers",
  81: "Showers",
  82: "Heavy Showers",
  85: "Light Snow Showers",
  86: "Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Hail",
  99: "Thunderstorm with Hail",
};

/**
 * Returns a full <svg>...</svg> string for the given WMO weather code.
 * @param {number} code - WMO weather code
 * @param {boolean} isDay - true for daytime icon variants
 * @param {{ size?: number, className?: string }} opts
 * @returns {string}
 */
export function getWeatherIcon(code, isDay, opts = {}) {
  const size = opts.size ?? 24;
  const className = opts.className ?? "";

  const entry = CODE_MAP[code] ?? { day: Cloud, night: Cloud, color: "color: var(--vscode-charts-blue)" };
  const iconData = isDay ? entry.day : entry.night;

  return lucideToSvg(iconData, size, entry.color, className);
}

/**
 * Returns a human-readable label for the given WMO weather code.
 * @param {number} code
 * @returns {string}
 */
export function getWeatherLabel(code) {
  return LABELS[code] ?? "Unknown";
}
