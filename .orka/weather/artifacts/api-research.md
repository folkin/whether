# API Research: Open-Meteo, Geocoding, and Alternatives

## 1. Open-Meteo Weather API

### Base URL

```
https://api.open-meteo.com/v1/forecast
```

All requests are GET. No API key required for non-commercial use.

---

### Current-Conditions Request

**Structure:**

```
https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current={variable1,variable2,...}
  &timezone={IANA_timezone|auto}
  &temperature_unit={celsius|fahrenheit}
  &wind_speed_unit={kmh|mph|ms|kn}
  &precipitation_unit={mm|inch}
```

**Required parameters:** `latitude`, `longitude`, and at least one data selection parameter (`current`, `hourly`, or `daily`).

**`current` variables useful for a dashboard:**

| Variable name | Description |
|---|---|
| `temperature_2m` | Air temperature at 2 m |
| `apparent_temperature` | Feels-like (wind + humidity adjusted) |
| `relative_humidity_2m` | Relative humidity % at 2 m |
| `precipitation` | Precipitation in last hour |
| `weather_code` | WMO code 0–99 |
| `wind_speed_10m` | Wind speed at 10 m |
| `wind_direction_10m` | Wind direction in degrees |
| `uv_index` | UV index |
| `visibility` | Visibility in metres (or feet/miles depending on unit setting) |
| `wind_gusts_10m` | Wind gusts at 10 m |
| `dew_point_2m` | Dew point at 2 m |
| `cloud_cover` | Total cloud cover % |
| `surface_pressure` | Surface pressure hPa |

---

### Daily Forecast Request

**Structure:**

```
https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &daily={variable1,variable2,...}
  &timezone={IANA_timezone|auto}
  &forecast_days={1-16}
  &temperature_unit={celsius|fahrenheit}
  &wind_speed_unit={kmh|mph|ms|kn}
  &precipitation_unit={mm|inch}
```

**`forecast_days`:** default is 7, max is 16.

**`daily` variables useful for a 7-day dashboard:**

| Variable name | Description |
|---|---|
| `temperature_2m_max` | Daily high temperature |
| `temperature_2m_min` | Daily low temperature |
| `apparent_temperature_max` | Daily high feels-like |
| `apparent_temperature_min` | Daily low feels-like |
| `precipitation_sum` | Total precipitation for the day |
| `precipitation_probability_max` | Max precipitation probability % |
| `weather_code` | Dominant WMO code for the day |
| `wind_speed_10m_max` | Maximum wind speed |
| `wind_direction_10m_dominant` | Dominant wind direction in degrees |
| `uv_index_max` | Maximum UV index |
| `sunshine_duration` | Total sunshine in seconds |

---

### Combined Current + 7-Day Daily Request (Real Example)

**Request URL (New York City, imperial units):**

```
https://api.open-meteo.com/v1/forecast
  ?latitude=40.7484
  &longitude=-73.9967
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index
  &daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max
  &temperature_unit=fahrenheit
  &wind_speed_unit=mph
  &precipitation_unit=inch
  &timezone=America/New_York
  &forecast_days=7
```

**Actual JSON response (live, captured 2026-04-04):**

```json
{
  "latitude": 40.736412,
  "longitude": -73.9841,
  "generationtime_ms": 0.989,
  "utc_offset_seconds": -14400,
  "timezone": "America/New_York",
  "timezone_abbreviation": "GMT-4",
  "elevation": 17.0,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°F",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°F",
    "precipitation": "inch",
    "weather_code": "wmo code",
    "wind_speed_10m": "mp/h",
    "wind_direction_10m": "°",
    "uv_index": ""
  },
  "current": {
    "time": "2026-04-04T09:00",
    "interval": 900,
    "temperature_2m": 64.5,
    "relative_humidity_2m": 80,
    "apparent_temperature": 64.4,
    "precipitation": 0.0,
    "weather_code": 3,
    "wind_speed_10m": 6.6,
    "wind_direction_10m": 10,
    "uv_index": 1.75
  },
  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°F",
    "temperature_2m_min": "°F",
    "apparent_temperature_max": "°F",
    "apparent_temperature_min": "°F",
    "precipitation_sum": "inch",
    "precipitation_probability_max": "%",
    "weather_code": "wmo code",
    "wind_speed_10m_max": "mp/h",
    "wind_direction_10m_dominant": "°",
    "uv_index_max": ""
  },
  "daily": {
    "time": ["2026-04-04", "2026-04-05", "2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10"],
    "temperature_2m_max": [73.8, 70.8, 56.9, 51.5, 44.1, 56.7, 58.8],
    "temperature_2m_min": [43.0, 42.2, 40.7, 33.8, 32.2, 40.1, 44.5],
    "apparent_temperature_max": [73.2, 69.2, 48.1, 40.1, 37.4, 48.2, 50.3],
    "apparent_temperature_min": [34.8, 34.7, 30.9, 21.8, 21.8, 31.1, 36.1],
    "precipitation_sum": [0.0, 0.154, 0.0, 0.0, 0.0, 0.0, 0.0],
    "precipitation_probability_max": [7, 76, 10, 12, 1, 4, 6],
    "weather_code": [3, 63, 3, 3, 0, 3, 3],
    "wind_speed_10m_max": [18.0, 15.4, 18.4, 23.4, 13.3, 17.1, 14.5],
    "wind_direction_10m_dominant": [86, 216, 283, 300, 150, 182, 20],
    "uv_index_max": [6.4, 2.55, 6.4, 5.95, 6.4, 4.7, 6.35]
  }
}
```

**Response shape notes:**
- The API snaps coordinates to the nearest model grid point, which is why `latitude`/`longitude` in the response may differ slightly from the request.
- Each variable in `current_units` / `daily_units` maps to the same key in `current` / `daily` — units are always explicit in the response.
- `daily.time` is an array of date strings; all other `daily` arrays are the same length and aligned by index.
- `current.interval` is 900 seconds (15 minutes) — the update cadence.

---

### WMO Weather Code Mapping

Open-Meteo uses WMO code table 4677. Not all codes 0–99 are used; the gaps (4–44, 49–50, 58–60, 68–70, 78–79, 83–84, 87–94) are undefined in this profile.

| Code | Day Label | Night Label |
|---|---|---|
| 0 | Sunny | Clear |
| 1 | Mainly Sunny | Mainly Clear |
| 2 | Partly Cloudy | Partly Cloudy |
| 3 | Cloudy | Cloudy |
| 45 | Foggy | Foggy |
| 48 | Rime Fog | Rime Fog |
| 51 | Light Drizzle | Light Drizzle |
| 53 | Drizzle | Drizzle |
| 55 | Heavy Drizzle | Heavy Drizzle |
| 56 | Light Freezing Drizzle | Light Freezing Drizzle |
| 57 | Freezing Drizzle | Freezing Drizzle |
| 61 | Light Rain | Light Rain |
| 63 | Rain | Rain |
| 65 | Heavy Rain | Heavy Rain |
| 66 | Light Freezing Rain | Light Freezing Rain |
| 67 | Freezing Rain | Freezing Rain |
| 71 | Light Snow | Light Snow |
| 73 | Snow | Snow |
| 75 | Heavy Snow | Heavy Snow |
| 77 | Snow Grains | Snow Grains |
| 80 | Light Showers | Light Showers |
| 81 | Showers | Showers |
| 82 | Heavy Showers | Heavy Showers |
| 85 | Light Snow Showers | Light Snow Showers |
| 86 | Snow Showers | Snow Showers |
| 95 | Thunderstorm | Thunderstorm |
| 96 | Light Thunderstorms With Hail | Light Thunderstorms With Hail |
| 99 | Thunderstorm With Hail | Thunderstorm With Hail |

Severity is roughly ascending: 0 = clearest, 99 = most severe. Day/night distinction is relevant only for icons (0 = sun vs. moon); the numerical code is the same regardless of time of day.

Source for this mapping: https://gist.github.com/stellasphere/9490c195ed2b53c707087c8c2db4ec0c

---

### Rate Limits and Usage Terms

**Free tier limits:**
- 10,000 API calls per day
- 5,000 per hour
- 600 per minute

**Non-commercial use is required for the free tier.** Allowed:
- Personal/private websites without ads or subscriptions
- Personal home automation
- Academic research (non-profit)
- Educational projects

Disallowed on the free tier:
- Apps or sites with subscriptions or advertisements
- Integration into commercial products
- Research at for-profit companies without a paid plan

**Attribution:** CC BY 4.0 applies to the underlying data. Attribution is required even for non-commercial use. The docs suggest crediting Open-Meteo and the source weather models.

**Privacy:** Open-Meteo operates with no tracking, no cookies, and no ads. CORS is supported, meaning requests can be made directly from the browser without a proxy. Servers are in Europe and North America with GeoDNS routing for low latency (response times typically under 10 ms).

**Commercial use:** Requires a paid plan with a `customer-` prefixed API key URL (e.g., `https://customer-api.open-meteo.com/v1/forecast?apikey=...`).

---

## 2. Open-Meteo Geocoding API

### Base URL

```
https://geocoding-api.open-meteo.com/v1/search
```

### Parameters

| Parameter | Required | Default | Notes |
|---|---|---|---|
| `name` | Yes | — | City name or postal code string |
| `count` | No | 10 | Max results (up to 100) |
| `language` | No | `en` | Result language/localization |
| `format` | No | `json` | `json` or `protobuf` |
| `countryCode` | No | — | ISO-3166-1 alpha-2 filter (e.g. `US`) |
| `apikey` | No | — | Required only for commercial use |

### ZIP Code Support

The API accepts postal codes via the `name` parameter. However, **it does not resolve the ZIP code to a specific postal boundary centroid.** It searches the Geonames city/place database and returns cities that have that ZIP code in their associated `postcodes` array.

**Practical result:** Querying `name=10001&countryCode=US` returns "New York" (the city) with coordinates `40.71427, -74.00597`, plus a `postcodes` array listing all ZIP codes associated with New York City. It does NOT return the centroid of the ZIP code 10001 specifically — it returns the city center.

**Example request:**
```
https://geocoding-api.open-meteo.com/v1/search?name=10001&count=3&language=en&format=json&countryCode=US
```

**Example response (live, 2026-04-04):**
```json
{
  "results": [
    {
      "id": 5128581,
      "name": "New York",
      "latitude": 40.71427,
      "longitude": -74.00597,
      "elevation": 10.0,
      "feature_code": "PPL",
      "country_code": "US",
      "admin1_id": 5128638,
      "timezone": "America/New_York",
      "population": 8804190,
      "postcodes": ["10001", "10002", "10003", ...],
      "country_id": 6252001,
      "country": "United States",
      "admin1": "New York"
    }
  ],
  "generationtime_ms": 0.317
}
```

**Verdict on ZIP lookup via Open-Meteo geocoding:** Usable but imprecise. For a dense urban ZIP like 10001 (Midtown Manhattan), the returned city centroid (40.714, -74.006 = lower Manhattan) is several miles from the ZIP centroid (~40.750, -73.997). For weather purposes this error is usually acceptable — weather doesn't change over a few miles — but it is not a precise ZIP centroid.

**Bigger problem:** Without `countryCode=US`, a ZIP like `10001` also matches Cáceres (Spain) and Troyes (France). The `countryCode` filter is essential. Even with it, the result is the city, not the ZIP area.

**Another problem:** The API's internal data source lists postal codes as reverse lookups on city entries. The GitHub repo for the geocoding API explicitly listed adding a dedicated postal code database as a "Todo" item. Coverage gaps are possible for rural ZIPs not associated with a major named place.

---

## 3. ZIP-to-lat/lon Problem: Recommended Options

### Option A — US Census Bureau ZCTA Gazetteer (Recommended for bundling)

**Source:** US Census Bureau, updated annually.

**Download URL:**
```
https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_zcta_national.zip
```

**File details:**
- Compressed: ~1.0 MB zip
- Format: Tab-delimited text (TSV), UTF-8
- Columns include: GEOID (5-digit ZIP/ZCTA), ALAND (land area), AWATER (water area), ALAND_SQMI, AWATER_SQMI, INTPTLAT (internal point latitude), INTPTLONG (internal point longitude)
- The INTPTLAT/INTPTLONG columns are the representative centroid of each ZCTA — this is what you want.

**License:** US federal government work, public domain. No restrictions, no attribution required.

**Coverage:** All US ZIP Code Tabulation Areas (ZCTAs). Note: ZCTAs are not identical to USPS ZIP codes — they are census-defined approximations. Most 5-digit ZIPs have a corresponding ZCTA, but some rarely used ZIP codes (e.g., unique PO Box-only ZIPs) may not have ZCTA entries.

**Approx record count:** ~33,000 ZCTAs (2020 Census base).

**For bundling:** Extract just GEOID + INTPTLAT + INTPTLONG from the TSV, convert to a minimal JSON or CSV. A stripped-down file with only those three columns for ~33,000 rows would be roughly 700–900 KB uncompressed, ~200 KB gzipped. Reasonable to bundle in a PWA.

---

### Option B — GeoNames US Postal Codes

**Source:** GeoNames project, crowd-sourced/maintained.

**Download URL:**
```
https://download.geonames.org/export/zip/US.zip
```

**File details:**
- Compressed: ~619 KB
- Format: Tab-delimited, UTF-8
- Columns: country_code, postal_code, place_name, admin_name1 (state), admin_code1, admin_name2 (county), admin_code2, admin_name3, admin_code3, latitude, longitude, accuracy

**License:** Creative Commons Attribution 3.0 (CC BY 3.0). Attribution required. Updated daily.

**Coverage:** US postal codes including some PO Box ZIPs. Coordinates are derived algorithmically from adjacent place centroids; accuracy varies (the `accuracy` column rates confidence 1–6).

**For bundling:** Slightly more complete than Census for edge-case ZIPs, but requires attribution and has variable coordinate accuracy.

---

### Option C — Open-Meteo Geocoding API (Runtime lookup, no bundle)

As described in section 2, querying `name={zip}&countryCode=US` works for most common ZIPs and returns a city center close enough for weather. This avoids bundling any data file.

**Tradeoff:** Requires a network round-trip before the weather fetch. Fails for rural/uncommon ZIPs with no named place match. Returns city centroid, not ZIP centroid.

---

### Option D — Nominatim / OpenStreetMap (not recommended for this use case)

Nominatim (https://nominatim.openstreetmap.org) supports US ZIP code lookup. Free, open, no key required. However, the OSM usage policy prohibits heavy/automated use from a single application; rate limits are strict (1 request/sec, no bulk use). Acceptable for a single initial lookup per user session but fragile for a production app.

---

### Recommended Approach

**Bundle the Census ZCTA Gazetteer, stripped to three columns (ZIP, lat, lon).** Rationale:

1. Public domain — zero licensing friction, no attribution required.
2. Authoritative — official US government source, updated annually.
3. Works offline / no extra network round-trip.
4. Size is acceptable for a PWA (~200 KB gzipped).
5. Precise ZIP centroids, not city approximations.

Implementation sketch:
- At build time, download and process `2023_Gaz_zcta_national.zip`, extract GEOID + INTPTLAT + INTPTLONG, and emit a compact JSON object: `{ "10001": [40.7484, -73.9967], ... }`.
- At runtime, `coords = ZIP_DATA[zip]` — O(1) lookup, zero network.
- Fall back to Open-Meteo geocoding API for any ZIP not found in the table.

If bundling is undesirable (e.g., strict size budget), the Open-Meteo geocoding API is the next-best option — it requires no key, no tracking, and is accurate enough for weather at city granularity.

---

## 4. Privacy-Respecting Weather API Alternatives

### National Weather Service (NWS) — api.weather.gov

**Base URL:** `https://api.weather.gov`

**No API key required**, no registration. US government service, public domain data.

**How it works — two-step process:**
1. `GET https://api.weather.gov/points/{lat},{lon}` — returns a JSON-LD object with links to forecast endpoints for that grid point.
2. Follow the `forecast` URL (e.g., `https://api.weather.gov/gridpoints/OKX/33,35/forecast`) — returns a 7-day forecast in GeoJSON format with periods (day/night).

**Privacy:** No tracking, no cookies, no analytics.

**Limitations:**
- US-only coverage.
- More complex response structure than Open-Meteo (GeoJSON with narrative "periods", not arrays of numeric values).
- No UV index, no precipitation probability as a clean numeric field (it's embedded in text descriptions).
- Requires a `User-Agent` header (any string identifying your app is fine).
- No CORS by default — browser requests may need a proxy or CORS header workaround. (Verified to be an issue for some browsers on direct fetch.)
- Data refresh cadence is slower than Open-Meteo (~hourly model runs).

**Verdict:** Viable as a US fallback, but meaningfully harder to integrate than Open-Meteo for a clean dashboard. Open-Meteo's structured arrays are far simpler to work with.

### Open-Meteo

Already documented above. This is the strong choice: no key, no tracking, CORS-native, global, fast, structured.

### What's not worth considering

- **OpenWeatherMap:** Free tier requires an API key and has usage caps. Tracks requests per key.
- **WeatherAPI.com:** Requires API key registration.
- **Weatherbit:** Requires API key.
- **Visual Crossing:** Has a free tier but requires API key.
- **Pirate Weather:** Open-source Dark Sky clone, no key for low volume, but limited uptime guarantees.

---

## Summary Table

| API | Key Required | Tracking | US ZIP support | Notes |
|---|---|---|---|---|
| Open-Meteo forecast | No | No | Via geocoding (imprecise) | Best overall choice |
| Open-Meteo geocoding | No | No | Partial — city centroid | Acceptable for weather, not ZIP centroid |
| NWS api.weather.gov | No | No | Via lat/lon | US only, complex structure, CORS issues |
| Census ZCTA (bundled) | N/A | N/A | Yes — precise centroid | Best for ZIP→lat/lon |
| GeoNames US.zip (bundled) | N/A | N/A | Yes — variable accuracy | CC BY 3.0 attribution required |
| Nominatim/OSM | No | No | Yes | Strict rate limits, not for production |
