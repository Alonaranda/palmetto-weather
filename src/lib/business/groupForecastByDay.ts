import type {
  OpenWeatherForecastEntry,
  OpenWeatherForecastResponse,
} from "../services/openweather";

/**
 * One aggregated day of the 5-day / 3-hour forecast. Picks the dominant
 * weather condition (the one that appears most often during the day) and
 * summarises the per-3h entries into daily totals.
 */
export interface DailyForecast {
  date: string;
  dayLabel: string;
  weekday: string;
  condition: {
    code: number;
    label: string;
    description: string;
    iconUrl: string;
  };
  temperature: {
    min: number;
    max: number;
  };
  precipitation: {
    probability: number;
    rainMm: number;
    snowMm: number;
  };
  wind: {
    maxSpeed: number;
  };
  humidityAverage: number;
  pressureAverage: number;
}

const OPENWEATHER_ICON_BASE = "https://openweathermap.org/img/wn";

/**
 * Group the 40 entries returned by OpenWeather's 5-day / 3-hour forecast
 * into one summary per local day. The grouping is performed in the city's
 * timezone offset (provided by the API in seconds from UTC) so the days
 * line up with what the user sees locally, not with UTC midnight.
 */
export function groupForecastByDay(
  forecast: OpenWeatherForecastResponse,
  options: { now?: Date; locale?: string } = {},
): DailyForecast[] {
  const { now = new Date(), locale = "en-US" } = options;
  const timezoneOffsetMs = forecast.city.timezone * 1000;

  const byDay = new Map<string, OpenWeatherForecastEntry[]>();
  for (const entry of forecast.list) {
    const date = localDateKey(entry.dt, timezoneOffsetMs);
    const bucket = byDay.get(date) ?? [];
    bucket.push(entry);
    byDay.set(date, bucket);
  }

  const todayKey = localDateKey(Math.floor(now.getTime() / 1000), timezoneOffsetMs);
  const tomorrowKey = localDateKey(
    Math.floor(now.getTime() / 1000) + 24 * 60 * 60,
    timezoneOffsetMs,
  );

  return Array.from(byDay.entries())
    .map(([date, entries]) => summariseDay(date, entries, locale, { todayKey, tomorrowKey }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function summariseDay(
  date: string,
  entries: OpenWeatherForecastEntry[],
  locale: string,
  labels: { todayKey: string; tomorrowKey: string },
): DailyForecast {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let pop = 0;
  let rain = 0;
  let snow = 0;
  let maxWind = 0;
  let humiditySum = 0;
  let pressureSum = 0;

  const conditionTally = new Map<number, { count: number; entry: OpenWeatherForecastEntry }>();

  for (const entry of entries) {
    min = Math.min(min, entry.main.temp_min);
    max = Math.max(max, entry.main.temp_max);
    pop = Math.max(pop, entry.pop ?? 0);
    rain += entry.rain?.["3h"] ?? 0;
    snow += entry.snow?.["3h"] ?? 0;
    maxWind = Math.max(maxWind, entry.wind.speed);
    humiditySum += entry.main.humidity;
    pressureSum += entry.main.pressure;

    const code = entry.weather[0]?.id ?? 800;
    const tallied = conditionTally.get(code);
    if (tallied) tallied.count += 1;
    else conditionTally.set(code, { count: 1, entry });
  }

  const dominant = Array.from(conditionTally.values()).reduce((best, current) =>
    current.count > best.count ? current : best,
  );
  const weather = dominant.entry.weather[0] ?? {
    id: 800,
    main: "Clear",
    description: "clear sky",
    icon: "01d",
  };

  const dayLabel =
    date === labels.todayKey
      ? "Today"
      : date === labels.tomorrowKey
        ? "Tomorrow"
        : new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday: "long" });

  return {
    date,
    dayLabel,
    weekday: new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday: "short" }),
    condition: {
      code: weather.id,
      label: weather.main,
      description: weather.description,
      iconUrl: `${OPENWEATHER_ICON_BASE}/${weather.icon}@2x.png`,
    },
    temperature: { min, max },
    precipitation: {
      probability: pop,
      rainMm: round(rain, 1),
      snowMm: round(snow, 1),
    },
    wind: { maxSpeed: round(maxWind, 1) },
    humidityAverage: Math.round(humiditySum / entries.length),
    pressureAverage: Math.round(pressureSum / entries.length),
  };
}

function localDateKey(unixSeconds: number, timezoneOffsetMs: number): string {
  const local = new Date(unixSeconds * 1000 + timezoneOffsetMs);
  const yyyy = local.getUTCFullYear();
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
