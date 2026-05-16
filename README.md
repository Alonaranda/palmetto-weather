# PalmettoWeather
<img width="1457" height="1009" alt="1" src="https://github.com/user-attachments/assets/b7292652-d792-41eb-98ed-470fcd90b8da" />
<img width="1453" height="930" alt="3" src="https://github.com/user-attachments/assets/7fcb6b5e-ae83-471c-b89f-8a98c581adff" />
<img width="1450" height="928" alt="2" src="https://github.com/user-attachments/assets/ee3975dc-cd46-431c-a868-457dd94382b8" />


A small Next.js application with two views:

- **Weather** (`/`) — automatic geolocation, current conditions, an
  interactive map of your location, and a 5-day forecast with daily metrics
  (rain probability, rain/snow amounts, max wind, humidity, pressure).
- **PokeWeather** (`/pokeweather`) — search any city and meet the Pokémon
  whose elemental type matches the current weather. Rainy day? A Water-type.
  Hot and sunny? A Fire-type. Misty? A Ghost-type.

Built with **Next.js 14 (Pages Router)**, **React 18**, **TypeScript**,
**styled-components**, **Leaflet** (open-source map tiles via OpenStreetMap),
**Biome**, and **Vitest**.

---

## Quick start

```bash
nvm use                     # picks up Node 22.18.0 from .nvmrc
npm install
cp .env.example .env.local  # paste your OpenWeather API key
npm run dev                 # http://localhost:3000
```

Three commands to a running app.

### Getting an OpenWeather API key

1. Create a free account at <https://openweathermap.org/api>.
2. Open **API keys** in your account and copy the default key.
3. Paste it into `.env.local` as `OPENWEATHER_API_KEY=...`.
4. New keys take **up to two hours** to activate. Until then the BFF will
   return `INVALID_API_KEY` and the UI will surface a clear message.

No PokeAPI account is needed — it's an open API. No map token is needed —
the map uses OpenStreetMap tiles.

---

## Available scripts

| Script                  | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Dev server at <http://localhost:3000>              |
| `npm run build`         | Production build                                   |
| `npm start`             | Run the production build                           |
| `npm run lint`          | Biome lint                                         |
| `npm run lint:fix`      | Biome lint with autofix                            |
| `npm run format`        | Biome formatter                                    |
| `npm run check`         | Lint + format check                                |
| `npm run check:fix`     | Lint + format with autofix                         |
| `npm test`              | Run the Vitest suite once                          |
| `npm run test:watch`    | Vitest in watch mode                               |
| `npm run test:coverage` | Vitest with V8 coverage (text + html + lcov)       |

---

## Architecture

The UI never talks to OpenWeather or PokeAPI directly. A thin BFF (Backend
For Frontend) inside the Next.js app handles all upstream calls — this keeps
the API key server-side, avoids CORS, and gives us one place to apply
caching, error mapping, and the business rules.

```
┌──────────────────────────┐
│  Browser (React + hooks) │
│  /     ───► useForecast ─┼──► GET /api/forecast?lat=…&lon=…
│  /pokeweather ─► useWeather ─► GET /api/weather?location=…
└──────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│  Next.js API routes (BFF)                                │
│   • /api/forecast → getForecast()                        │
│   • /api/weather  → getWeatherWithCompanion()            │
└─────────────┬────────────────────────────────────────────┘
              │
       ┌──────┴───────┬───────────────────────────┐
       ▼              ▼                           ▼
  OpenWeather    OpenWeather                  PokeAPI
  /current       /forecast                    /type, /pokemon
```

### Source layout

```
src/
├── components/                       # Grouped by feature; each Comp lives next to its .styles.tsx
│   ├── shared/                       # Cross-feature primitives
│   │   ├── ErrorBoundary.{tsx,styles.tsx,test.tsx}
│   │   ├── ErrorMessage.{tsx,styles.tsx}
│   │   ├── Header.{tsx,styles.tsx}
│   │   ├── LocationSearch.{tsx,styles.tsx,test.tsx}
│   │   └── UnitsToggle.{tsx,styles.tsx}
│   ├── forecast/                     # Used by the Weather page (/)
│   │   ├── CurrentWeatherHero.{tsx,styles.tsx}
│   │   ├── DailyForecastList.{tsx,styles.tsx}
│   │   ├── WeatherMap.{tsx,styles.tsx}
│   │   └── WeatherMetrics.{tsx,styles.tsx}
│   ├── pokeweather/                  # Used by the PokeWeather page
│   │   ├── PokeWeatherShowcase.{tsx,styles.tsx}
│   │   ├── PokemonCompanion.{tsx,styles.tsx}
│   │   └── WeatherCard.{tsx,styles.tsx}
│   └── recommendations/              # Used by the Recommendations page
│       ├── EmailRecommendationsButton.{tsx,styles.tsx}
│       └── RecommendationsList.{tsx,styles.tsx}
├── hooks/
│   ├── useForecast.ts                # Forecast lookup state machine
│   ├── useForecastWithGeolocation.ts # Composed hook used by / and /recommendations
│   ├── useGeolocation.ts             # Browser Geolocation wrapper
│   └── useWeather.ts                 # Weather + companion lookup (PokeWeather)
├── lib/
│   ├── business/
│   │   ├── groupForecastByDay.ts     # 5d / 3h → daily summary
│   │   └── weatherToPokemonType.ts   # weather → Pokémon type rule
│   ├── services/
│   │   ├── openweather.ts            # Direct REST client (current + forecast)
│   │   └── pokeapi.ts                # Direct REST client (type + detail)
│   ├── contracts.ts                  # Public BFF response shapes
│   ├── errors.ts                     # ApiError + ApiErrorCode
│   ├── http.ts                       # fetch wrapper with timeout
│   ├── forecastService.ts            # Orchestrator for /api/forecast
│   └── weatherService.ts             # Orchestrator for /api/weather
├── pages/
│   ├── _app.tsx                      # ThemeProvider + GlobalStyle + Header
│   ├── _document.tsx                 # styled-components SSR collection
│   ├── api/
│   │   ├── forecast.ts               # BFF: current + daily forecast
│   │   └── weather.ts                # BFF: current + Pokémon companion
│   ├── index.tsx                     # Weather page (geo + forecast + map)
│   └── pokeweather.tsx               # PokeWeather page
├── styles/
│   ├── GlobalStyle.ts
│   ├── pages/                        # Page-level styled-components
│   │   ├── index.styles.tsx
│   │   └── pokeweather.styles.tsx
│   ├── styled.d.ts                   # styled-components theme typings
│   └── theme.ts
├── types/
│   └── images.d.ts                   # Module declaration for PNG imports
└── __tests__/api/                    # API route tests (kept out of pages/)
```

### Style convention

Each component is split into two files:

- **`Component.tsx`** — props, hooks, JSX, business decisions.
- **`Component.styles.tsx`** — only `styled-components`. The component
  imports its primitives from this file.

This keeps each layer focused on one thing and makes diffs easy to read at
review time.

### Business rules

**Forecast aggregation** — `groupForecastByDay` collapses the 40 entries
returned by OpenWeather's 5-day / 3-hour endpoint into one row per local
day. It uses the city's timezone offset (not UTC) so days line up with what
the user sees locally. The dominant condition is the one that appears most
often across the 3-hour buckets.

**Weather → Pokémon type** — `weatherToPokemonType` maps OpenWeather
condition codes (<https://openweathermap.org/weather-conditions>) plus
temperature, wind, and day/night into a Pokémon type:

| Condition code  | Modifier              | Pokémon type | Why                              |
| --------------- | --------------------- | ------------ | -------------------------------- |
| `2xx` Thunder   | —                     | `electric`   | Thunder = electric, naturally    |
| `3xx` Drizzle   | —                     | `water`      | Rain = water                     |
| `5xx` Rain      | —                     | `water`      | Rain = water                     |
| `6xx` Snow      | —                     | `ice`        | Snow = ice                       |
| `7xx` Atmosphere | (fog, haze, etc.)    | `ghost`      | Mysterious atmospheres           |
| any             | wind ≥ 10 m/s         | `flying`     | Strong gusts (storms excepted)   |
| `80x` Clouds    | —                     | `flying`     | Sky dwellers                     |
| `800` Clear     | night                 | `dark`       | Stargazing                       |
| `800` Clear     | ≥ 28 °C               | `fire`       | Hot and sunny                    |
| `800` Clear     | < 5 °C                | `ice`        | Cold and clear                   |
| `800` Clear     | mild                  | `grass`      | Perfect growing weather          |
| any other       | —                     | `normal`     | Defensive fallback               |

Both rules are pure functions, fully unit-tested.

---

## API reference

### `GET /api/forecast`

Returns the current weather plus a 5-day daily forecast.

| Param      | Type   | Required | Notes                                              |
| ---------- | ------ | -------- | -------------------------------------------------- |
| `lat`      | number | one of   | -90 to 90                                          |
| `lon`      | number | one of   | -180 to 180                                        |
| `location` | string | one of   | Free-text city. Either `lat+lon` **or** `location` |
| `units`    | string | no       | `metric` (default), `imperial`, `standard`         |

```json
{
  "current": {
    "location": { "name": "Bogotá", "country": "CO", "coordinates": { "lat": 4.71, "lon": -74.07 } },
    "observedAt": "2026-05-16T15:00:00.000Z",
    "conditions": { "code": 500, "label": "Rain", "description": "light rain", "iconUrl": "https://openweathermap.org/img/wn/10d@2x.png" },
    "temperature": { "current": 17, "feelsLike": 16, "min": 15, "max": 19, "unit": "C" },
    "wind": { "speed": 3, "unit": "m/s" },
    "humidity": 80,
    "isDaytime": true
  },
  "daily": [
    {
      "date": "2026-05-16",
      "dayLabel": "Today",
      "weekday": "Sat",
      "condition": { "code": 500, "label": "Rain", "description": "light rain", "iconUrl": "https://openweathermap.org/img/wn/10d@2x.png" },
      "temperature": { "min": 15, "max": 19 },
      "precipitation": { "probability": 0.6, "rainMm": 4.5, "snowMm": 0 },
      "wind": { "maxSpeed": 5.2 },
      "humidityAverage": 78,
      "pressureAverage": 1013
    }
  ]
}
```

### `GET /api/weather`

Returns the current weather plus a Pokémon companion (PokeWeather feature).

| Param      | Type   | Required | Notes                                       |
| ---------- | ------ | -------- | ------------------------------------------- |
| `location` | string | yes      | Free-text city, optionally `city,country`   |
| `units`    | string | no       | `metric` (default), `imperial`, `standard`  |

Both endpoints respond with `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.

### Error responses

```json
{ "error": { "code": "LOCATION_NOT_FOUND", "message": "Location \"Atlantis\" not found", "source": "openweather" } }
```

| Code                    | HTTP            | Cause                                          |
| ----------------------- | --------------- | ---------------------------------------------- |
| `BAD_REQUEST`           | 400 / 405       | Missing/invalid params or wrong HTTP method    |
| `LOCATION_NOT_FOUND`    | 404             | OpenWeather did not recognise the location     |
| `INVALID_API_KEY`       | 401 / 500       | Key missing or rejected (often: still activating) |
| `RATE_LIMITED`          | 429             | Upstream throttled us                          |
| `UPSTREAM_UNAVAILABLE`  | 502 / 503 / 504 | Network error / timeout / upstream 5xx         |
| `INVALID_RESPONSE`      | 502             | Upstream sent malformed data                   |
| `INTERNAL_ERROR`        | 500             | Unexpected server bug                          |

---

## Testing

Tests live next to the code they cover (`*.test.ts(x)`), except API-route
tests which live under `src/__tests__/api/` to keep them out of Next.js's
page detection.

Coverage:

- **Business rules** — `weatherToPokemonType` (every branch) and
  `groupForecastByDay` (aggregation, dominant condition, sort, labels).
- **Service layer** — `openweather` and `pokeapi` with mocked `fetch`,
  asserting URL shape and each upstream status code mapping.
- **Orchestrators** — `weatherService` and `forecastService`
  end-to-end with mocked fetch, including unit conversions.
- **BFF routes** — `pages/api/weather` and `pages/api/forecast` exercised
  with a hand-rolled `req` / `res` mock.
- **UI** — `LocationSearch` interaction tests via Testing Library +
  `user-event`, wrapped in `ThemeProvider`.

Run them with:

```bash
npm test
npm run test:coverage    # generates ./coverage/index.html
```

---

## Production-ready notes

What's already in place:

- **Secrets stay on the server** — the OpenWeather key is read from
  `process.env`, never shipped to the browser.
- **Typed errors** — `ApiError` + `ApiErrorCode` give a stable contract that
  the UI maps to human copy.
- **Request cancellation** — both hooks abort in-flight requests when the
  user issues a new query or unmounts.
- **Timeouts** — every upstream call has an 8-second timeout so a hanging
  provider never blocks the BFF.
- **Caching headers** — successful responses set
  `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`, ready
  for an edge / CDN deployment.
- **Parallel upstream fanout** — the forecast endpoint issues current +
  forecast in parallel via `Promise.all` to minimise latency.
- **SSR-safe styled-components** — `_document.tsx` collects styles to avoid
  the flash of unstyled content.
- **Error boundary** — `_app.tsx` wraps every page so a render-time
  exception surfaces a friendly fallback instead of a blank screen.
- **Client-only map** — Leaflet uses `window`, so `WeatherMap` is loaded
  with `next/dynamic({ ssr: false })`.
- **Geolocation fallback** — if the user denies the permission prompt, a
  manual location search is offered.
- **Accessible UI** — semantic landmarks, `aria-label`, `aria-busy`, and
  associated `<label>` for the search input.

What I would add next for a real launch:

- Replace `console.error` with a structured logger (pino) sending to a
  monitoring backend such as Sentry / Datadog so the `INTERNAL_ERROR`
  branch is alertable.
- Validate upstream payloads with Zod so schema drift surfaces as
  `INVALID_RESPONSE` instead of runtime crashes.
- Persist the last searched location in `localStorage` for a friendlier UX.
- Server-side rate limiting (e.g. `@upstash/ratelimit`) keyed by IP so a
  noisy client cannot exhaust the OpenWeather quota.
- Playwright smoke tests against a deployed preview environment.
- OpenAPI document generated from the contract types (`zod-to-openapi`),
  served at `/api/docs`.
