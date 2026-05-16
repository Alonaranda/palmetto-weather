import type { WeatherWithCompanion } from "@/lib/contracts";
import type { ApiErrorCode } from "@/lib/errors";
import { parseJsonResponse } from "@/lib/parseJsonResponse";
import { useCallback, useEffect, useRef, useState } from "react";

export type WeatherStatus = "idle" | "loading" | "success" | "error";

export interface UseWeatherState {
  status: WeatherStatus;
  data: WeatherWithCompanion | null;
  error: { code: ApiErrorCode; message: string } | null;
}

export interface UseWeatherResult extends UseWeatherState {
  search: (location: string) => Promise<void>;
  reset: () => void;
}

const initialState: UseWeatherState = { status: "idle", data: null, error: null };

/**
 * Drives the weather lookup from the UI. Cancels stale requests when the
 * user issues a new search and keeps the latest successful payload visible
 * while a refresh is in flight (no jarring blank states).
 */
export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<UseWeatherState>(initialState);
  const inFlightRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      inFlightRef.current?.abort();
    };
  }, []);

  const search = useCallback(async (location: string) => {
    const trimmed = location.trim();
    if (!trimmed) return;

    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      const result = await parseJsonResponse<WeatherWithCompanion>(response);
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
        error: {
          code: "INTERNAL_ERROR",
          message: (err as Error).message || "Network error",
        },
      });
    }
  }, []);

  const reset = useCallback(() => {
    inFlightRef.current?.abort();
    setState(initialState);
  }, []);

  return { ...state, search, reset };
}
