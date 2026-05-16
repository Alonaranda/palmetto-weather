import { useCallback, useEffect, useState } from "react";

export type GeolocationStatus = "idle" | "prompting" | "success" | "denied" | "unavailable";

export interface GeoCoords {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface UseGeolocationState {
  status: GeolocationStatus;
  coords: GeoCoords | null;
  error: string | null;
}

export interface UseGeolocationResult extends UseGeolocationState {
  request: () => void;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Tiny wrapper around the Geolocation API. We expose a status machine so the
 * UI can render a sensible state for each phase, and an explicit `request()`
 * helper so the user can retry after denying or after a timeout.
 *
 * Note: the browser always prompts on first access — we cannot bypass that
 * by design. When permission is denied, the caller should fall back to a
 * manual location search.
 */
export function useGeolocation(autoRequest = true): UseGeolocationResult {
  const [state, setState] = useState<UseGeolocationState>({
    status: "idle",
    coords: null,
    error: null,
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "unavailable",
        coords: null,
        error: "Geolocation is not supported in this browser.",
      });
      return;
    }

    setState({ status: "prompting", coords: null, error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          error: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          status: denied ? "denied" : "unavailable",
          coords: null,
          error: err.message || (denied ? "Permission denied" : "Could not determine location"),
        });
      },
      { enableHighAccuracy: false, timeout: DEFAULT_TIMEOUT_MS, maximumAge: 5 * 60_000 },
    );
  }, []);

  useEffect(() => {
    if (autoRequest) request();
  }, [autoRequest, request]);

  return { ...state, request };
}
