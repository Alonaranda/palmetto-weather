import type { ApiErrorBody, ForecastResponse } from "@/lib/contracts";
import { ApiError } from "@/lib/errors";
import { getForecast } from "@/lib/forecastService";
import type { LocationQuery, Units } from "@/lib/services/openweather";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * GET /api/forecast?lat=<number>&lon=<number>&units=<metric|imperial|standard>
 * GET /api/forecast?location=<string>&units=<...>
 *
 * Returns current weather + 5-day daily forecast for the given location.
 * Either `lat` + `lon` or `location` must be provided.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForecastResponse | ApiErrorBody>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: { code: "BAD_REQUEST", message: "Only GET is supported" },
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { code: "INVALID_API_KEY", message: "Server is missing OPENWEATHER_API_KEY" },
    });
  }

  let location: LocationQuery;
  try {
    location = readLocation(req);
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json(err.toJSON());
    }
    throw err;
  }

  const units = readUnits(req.query.units);

  try {
    const data = await getForecast({ location, apiKey, units });
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json(err.toJSON());
    }
    console.error("[api/forecast] unexpected error", err);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
    });
  }
}

function readLocation(req: NextApiRequest): LocationQuery {
  const lat = readSingleParam(req.query.lat);
  const lon = readSingleParam(req.query.lon);

  if (lat !== null && lon !== null) {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      throw new ApiError("BAD_REQUEST", "'lat' and 'lon' must be numbers", 400);
    }
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      throw new ApiError("BAD_REQUEST", "Coordinates out of range", 400);
    }
    return { type: "coords", lat: latNum, lon: lonNum };
  }

  const name = readSingleParam(req.query.location);
  if (name) return { type: "name", value: name };

  throw new ApiError(
    "BAD_REQUEST",
    "Provide either 'lat' + 'lon' or a 'location' query parameter",
    400,
  );
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
