import { groupForecastByDay } from "./business/groupForecastByDay";
import type { ForecastResponse } from "./contracts";
import type { FetchLike } from "./http";
import {
  type LocationQuery,
  type Units,
  fetchCurrentWeather,
  fetchForecast,
} from "./services/openweather";
import { mapWeather } from "./weatherService";

export interface GetForecastParams {
  location: LocationQuery;
  apiKey: string;
  units?: Units;
  fetchImpl?: FetchLike;
  signal?: AbortSignal;
  now?: Date;
}

/**
 * Fan out to the current-weather and 5-day-forecast OpenWeather endpoints in
 * parallel, then reshape into the public contract. Both calls share the same
 * upstream so we re-use the same error mapping for free.
 */
export async function getForecast(params: GetForecastParams): Promise<ForecastResponse> {
  const { location, apiKey, units = "metric", fetchImpl, signal, now } = params;

  const [currentRaw, forecastRaw] = await Promise.all([
    fetchCurrentWeather({ location, apiKey, units, fetchImpl, signal }),
    fetchForecast({ location, apiKey, units, fetchImpl, signal }),
  ]);

  return {
    current: mapWeather(currentRaw, units),
    daily: groupForecastByDay(forecastRaw, { now }),
  };
}
