import type { ApiErrorBody, WeatherWithCompanion } from "@/lib/contracts";
import { ApiError } from "@/lib/errors";
import type { Units } from "@/lib/services/openweather";
import { getWeatherWithCompanion } from "@/lib/weatherService";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * GET /api/weather?location=<string>&units=<metric|imperial|standard>
 *
 * Backend-for-frontend that fans out to OpenWeather and PokeAPI, applies the
 * weather → Pokémon business rule, and returns a single contract for the UI.
 *
 * Errors are returned as `{ error: { code, message } }` with appropriate
 * HTTP status codes so the client can render predictable UI states.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherWithCompanion | ApiErrorBody>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: { code: "BAD_REQUEST", message: "Only GET is supported" },
    });
  }

  const location = readSingleParam(req.query.location);
  const units = readUnits(req.query.units);

  if (!location) {
    return res.status(400).json({
      error: { code: "BAD_REQUEST", message: "Query param 'location' is required" },
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    // We never leak the missing-key state to clients as a 500 stack — just
    // surface a stable error code the UI can show to a developer.
    return res.status(500).json({
      error: {
        code: "INVALID_API_KEY",
        message: "Server is missing OPENWEATHER_API_KEY",
      },
    });
  }

  try {
    const data = await getWeatherWithCompanion({ location, apiKey, units });
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json(err.toJSON());
    }
    // Anything else is a programmer error — log so it surfaces in server logs
    // but don't leak details to the client.
    console.error("[api/weather] unexpected error", err);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
    });
  }
}

function readSingleParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0]?.trim() || null;
  if (typeof value === "string") return value.trim() || null;
  return null;
}

function readUnits(value: string | string[] | undefined): Units {
  const raw = readSingleParam(value);
  if (raw === "imperial" || raw === "standard" || raw === "metric") return raw;
  return "metric";
}
