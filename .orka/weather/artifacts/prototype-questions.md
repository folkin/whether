---
type: prototype-review
cycle: 2
---

# Prototype Review: Decisions

## Answers (cycle 2)

- **Layout:** approved as-is
- **Icon color treatment:** accent colors (condition-based tinting) — for both current conditions and forecast strip
- **App icon:** `cloud-sun`

---

# Original Questions

Open `prototypes/weather-prototype.html` in a browser. Use the theme toggle to check both light and dark. Then answer:

---

**1. Layout feel**

Current hierarchy: offline banner → header → current conditions card (large temp + detail grid) → 7-day forecast strip → app icon candidates.

Does this read order feel right, or is something in the wrong place? Anything that should be bigger, smaller, or moved?

---

**2. Icon color treatment**

The current conditions card shows the condition icon twice side by side. The forecast strip shows two labeled rows — "Monochrome" and "Accent color".

- **Monochrome:** icons inherit `--fg` (gray in dark, near-black in light)
- **Accent color:** icons tinted by condition type (amber for sun, blue for rain/clouds, light blue for snow, red-purple for storms, gray for fog/overcast)

Which do you prefer? Or neither — a different approach entirely?

---

**3. App icon**

Bottom of the page shows three candidates at icon size on an accent-colored background:

- `cloud-sun` — classic weather app feel
- `sun` — clean, minimal
- `cloud` — understated

Which one? (This becomes the PWA home screen icon.)
