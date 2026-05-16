import type { ForecastResponse } from "@/lib/contracts";
import type { ApiErrorCode } from "@/lib/errors";
import { parseJsonResponse } from "@/lib/parseJsonResponse";
import { useCallback, useEffect, useRef, useState } from "react";

export type ForecastStatus = "idle" | "loading" | "success" | "error";

export type ForecastUnits = "metric" | "imperial";

export type ForecastQuery =
  | { type: "coords"; lat: number; lon: number; units?: ForecastUnits }
  | { type: "name"; value: string; units?: ForecastUnits };

export interface UseForecastState {
  status: ForecastStatus;
  data: ForecastResponse | null;
  error: { code: ApiErrorCode; message: string } | null;
}

export interface UseForecastResult extends UseForecastState {
  fetchForecast: (query: ForecastQuery) => Promise<void>;
  reset: () => void;
}

const initialState: UseForecastState = { status: "idle", data: null, error: null };

/**
 * Manages forecast lookups against the BFF, with request cancellation when
 * the query changes or the component unmounts. Keeps the last successful
 * payload visible during refresh to avoid flicker.
 */
export function useForecast(): UseForecastResult {
  const [state, setState] = useState<UseForecastState>(initialState);
  const inFlightRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      inFlightRef.current?.abort();
    };
  }, []);

  const fetchForecast = useCallback(async (query: ForecastQuery) => {
    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    const params = new URLSearchParams();
    if (query.type === "coords") {
      params.set("lat", String(query.lat));
      params.set("lon", String(query.lon));
    } else {
      const trimmed = query.value.trim();
      if (!trimmed) return;
      params.set("location", trimmed);
    }
    if (query.units) params.set("units", query.units);

    try {
      const response = await fetch(`/api/forecast?${params.toString()}`, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      const result = await parseJsonResponse<ForecastResponse>(response);
      if (controller.signal.aborted) return;

      if (!result.ok) {
        setState({ status: "error", data: null, error: result.error });
        return;
      }
      setState({ status: "success", data: result.data, error: null });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState({
        status: "error",
        data: null,
        error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Network error" },
      });
    }
  }, []);

  const reset = useCallback(() => {
    inFlightRef.current?.abort();
    setState(initialState);
  }, []);

  return { ...state, fetchForecast, reset };
}
