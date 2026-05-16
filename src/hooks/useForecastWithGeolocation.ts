import type { ApiErrorCode } from "@/lib/errors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ForecastQuery,
  type ForecastStatus,
  type ForecastUnits,
  useForecast,
} from "./useForecast";
import { type GeolocationStatus, useGeolocation } from "./useGeolocation";

export type ActiveQuery =
  | { type: "coords"; lat: number; lon: number }
  | { type: "name"; value: string };

export interface UseForecastWithGeolocationOptions {
  /** Whether the page allows the user to switch units (defaults to true). */
  unitsEnabled?: boolean;
  /** Initial unit, default `"metric"`. */
  initialUnits?: ForecastUnits;
}

export interface UseForecastWithGeolocationResult {
  // Forecast state
  status: ForecastStatus;
  data: ReturnType<typeof useForecast>["data"];
  error: { code: ApiErrorCode; message: string } | null;
  // Geo state
  geoStatus: GeolocationStatus;
  // Units
  units: ForecastUnits;
  setUnits: (next: ForecastUnits) => void;
  // Actions
  searchManually: (location: string) => void;
  /** True once the user has either typed a search or the browser denied geo. */
  showFallbackSearch: boolean;
}

/**
 * Wires geolocation + forecast into a single hook with the bootstrap rules
 * we want on the Weather and Recommendations pages:
 *
 * - Auto-fetch once the geolocation resolves (only once — units changes do
 *   not re-trigger the bootstrap).
 * - Manual search overrides the geo-driven location until reset.
 * - Switching units re-fetches the *active* query (whatever the user is
 *   currently looking at), not the bootstrap defaults.
 * - Permission denied / unavailable surfaces the fallback search.
 */
export function useForecastWithGeolocation(
  options: UseForecastWithGeolocationOptions = {},
): UseForecastWithGeolocationResult {
  const { initialUnits = "metric" } = options;

  const geo = useGeolocation(true);
  const forecast = useForecast();
  const { fetchForecast } = forecast;

  const [units, setUnitsState] = useState<ForecastUnits>(initialUnits);
  const [searchedManually, setSearchedManually] = useState(false);

  const activeQueryRef = useRef<ActiveQuery | null>(null);
  const didBootstrapRef = useRef(false);

  const runQuery = useCallback(
    (query: ActiveQuery, nextUnits: ForecastUnits) => {
      activeQueryRef.current = query;
      void fetchForecast({ ...query, units: nextUnits } as ForecastQuery);
    },
    [fetchForecast],
  );

  useEffect(() => {
    if (didBootstrapRef.current) return;
    if (geo.status === "success" && geo.coords && !searchedManually) {
      didBootstrapRef.current = true;
      runQuery({ type: "coords", lat: geo.coords.lat, lon: geo.coords.lon }, units);
    }
  }, [geo.status, geo.coords, searchedManually, units, runQuery]);

  const searchManually = useCallback(
    (location: string) => {
      const trimmed = location.trim();
      if (!trimmed) return;
      setSearchedManually(true);
      runQuery({ type: "name", value: trimmed }, units);
    },
    [runQuery, units],
  );

  const setUnits = useCallback(
    (next: ForecastUnits) => {
      if (next === units) return;
      setUnitsState(next);
      if (activeQueryRef.current) runQuery(activeQueryRef.current, next);
    },
    [units, runQuery],
  );

  const showFallbackSearch =
    geo.status === "denied" || geo.status === "unavailable" || searchedManually;

  return {
    status: forecast.status,
    data: forecast.data,
    error: forecast.error,
    geoStatus: geo.status,
    units,
    setUnits,
    searchManually,
    showFallbackSearch,
  };
}
