import { ApiError } from "../errors";
import { type FetchLike, UpstreamHttpError, getJson } from "../http";

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Subset of the OpenWeather `GET /data/2.5/weather` response we depend on.
 * Reference: https://openweathermap.org/current
 */
export interface OpenWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OpenWeatherResponse {
  name: string;
  sys: { country?: string; sunrise: number; sunset: number };
  coord: { lat: number; lon: number };
  dt: number;
  timezone: number;
  weather: OpenWeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  visibility?: number;
}

/**
 * Subset of the OpenWeather `GET /data/2.5/forecast` response we depend on.
 * Returns 40 entries — one every 3 hours over 5 days.
 * Reference: https://openweathermap.org/forecast5
 */
export interface OpenWeatherForecastEntry {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: OpenWeatherCondition[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility?: number;
  pop: number;
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
  sys: { pod: "d" | "n" };
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastEntry[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export type Units = "metric" | "imperial" | "standard";

export interface LocationQueryByName {
  type: "name";
  value: string;
}

export interface LocationQueryByCoords {
  type: "coords";
  lat: number;
  lon: number;
}

export type LocationQuery = LocationQueryByName | LocationQueryByCoords;

interface OpenWeatherRequestBase {
  apiKey: string;
  units?: Units;
  lang?: string;
  fetchImpl?: FetchLike;
  signal?: AbortSignal;
}

export interface FetchCurrentWeatherParams extends OpenWeatherRequestBase {
  location: LocationQuery;
}

export interface FetchForecastParams extends OpenWeatherRequestBase {
  location: LocationQuery;
}

/** Fetch the current observation for either a free-text location or coordinates. */
export async function fetchCurrentWeather(
  params: FetchCurrentWeatherParams,
): Promise<OpenWeatherResponse> {
  return callOpenWeather<OpenWeatherResponse>("weather", params);
}

/** Fetch the 5-day / 3-hour forecast for either a free-text location or coordinates. */
export async function fetchForecast(
  params: FetchForecastParams,
): Promise<OpenWeatherForecastResponse> {
  return callOpenWeather<OpenWeatherForecastResponse>("forecast", params);
}

async function callOpenWeather<T>(
  path: "weather" | "forecast",
  params: FetchCurrentWeatherParams | FetchForecastParams,
): Promise<T> {
  const { location, apiKey, units = "metric", lang = "en", fetchImpl, signal } = params;

  if (!apiKey) {
    throw new ApiError("INVALID_API_KEY", "Missing OpenWeather API key", 500, "openweather");
  }

  const url = new URL(`${OPENWEATHER_BASE_URL}/${path}`);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", units);
  url.searchParams.set("lang", lang);

  if (location.type === "name") {
    const trimmed = location.value.trim();
    if (!trimmed) {
      throw new ApiError("BAD_REQUEST", "Location is required", 400, "openweather");
    }
    url.searchParams.set("q", trimmed);
  } else {
    if (!Number.isFinite(location.lat) || !Number.isFinite(location.lon)) {
      throw new ApiError("BAD_REQUEST", "Invalid coordinates", 400, "openweather");
    }
    url.searchParams.set("lat", String(location.lat));
    url.searchParams.set("lon", String(location.lon));
  }

  try {
    return await getJson<T>(url.toString(), { fetchImpl, signal });
  } catch (err) {
    if (err instanceof UpstreamHttpError) {
      if (err.status === 404) {
        const desc =
          location.type === "name"
            ? `"${location.value.trim()}"`
            : `(${location.lat}, ${location.lon})`;
        throw new ApiError("LOCATION_NOT_FOUND", `Location ${desc} not found`, 404, "openweather");
      }
      if (err.status === 401) {
        throw new ApiError(
          "INVALID_API_KEY",
          "OpenWeather rejected the API key (it may still be activating)",
          401,
          "openweather",
        );
      }
      if (err.status === 429) {
        throw new ApiError("RATE_LIMITED", "OpenWeather rate limit exceeded", 429, "openweather");
      }
      throw new ApiError(
        "UPSTREAM_UNAVAILABLE",
        `OpenWeather upstream error (${err.status})`,
        502,
        "openweather",
      );
    }
    throw err;
  }
}
