import handler from "@/pages/api/forecast";
import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MockResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
}

function createMocks(method: string, query: Record<string, string>) {
  const req = { method, query } as unknown as NextApiRequest;
  const mock: MockResponse = { statusCode: 200, body: undefined, headers: {} };
  const res = {
    status(code: number) {
      mock.statusCode = code;
      return this;
    },
    json(body: unknown) {
      mock.body = body;
      return this;
    },
    setHeader(key: string, value: string) {
      mock.headers[key.toLowerCase()] = value;
      return this;
    },
  } as unknown as NextApiResponse;
  return { req, res, mock };
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

const currentPayload = {
  name: "Bogotá",
  sys: { country: "CO", sunrise: 1_700_000_000, sunset: 1_700_050_000 },
  coord: { lat: 4.71, lon: -74.07 },
  dt: 1_700_020_000,
  timezone: -18000,
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  main: { temp: 22, feels_like: 21, temp_min: 20, temp_max: 24, humidity: 60, pressure: 1015 },
  wind: { speed: 2, deg: 90 },
  clouds: { all: 10 },
};

const forecastPayload = {
  list: [],
  city: {
    id: 1,
    name: "Bogotá",
    coord: { lat: 4.71, lon: -74.07 },
    country: "CO",
    timezone: 0,
    sunrise: 0,
    sunset: 0,
  },
};

describe("GET /api/forecast", () => {
  const originalKey = process.env.OPENWEATHER_API_KEY;

  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.OPENWEATHER_API_KEY = originalKey;
  });

  it("returns the forecast contract for valid coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(currentPayload))
        .mockResolvedValueOnce(jsonResponse(forecastPayload)),
    );

    const { req, res, mock } = createMocks("GET", { lat: "4.71", lon: "-74.07" });
    await handler(req, res);

    expect(mock.statusCode).toBe(200);
    expect(mock.headers["cache-control"]).toContain("s-maxage=300");
    expect(mock.body).toMatchObject({
      current: { location: { name: "Bogotá" } },
      daily: [],
    });
  });

  it("accepts a free-text location instead of coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(currentPayload))
        .mockResolvedValueOnce(jsonResponse(forecastPayload)),
    );

    const { req, res, mock } = createMocks("GET", { location: "Bogotá" });
    await handler(req, res);

    expect(mock.statusCode).toBe(200);
  });

  it("returns 400 when neither coords nor location are provided", async () => {
    const { req, res, mock } = createMocks("GET", {});
    await handler(req, res);
    expect(mock.statusCode).toBe(400);
    expect(mock.body).toMatchObject({ error: { code: "BAD_REQUEST" } });
  });

  it("returns 400 when coords are out of range", async () => {
    const { req, res, mock } = createMocks("GET", { lat: "100", lon: "0" });
    await handler(req, res);
    expect(mock.statusCode).toBe(400);
  });

  it("rejects non-GET methods with 405", async () => {
    const { req, res, mock } = createMocks("POST", { lat: "0", lon: "0" });
    await handler(req, res);
    expect(mock.statusCode).toBe(405);
  });

  it("returns 500 with INVALID_API_KEY when the env var is missing", async () => {
    process.env.OPENWEATHER_API_KEY = "";
    const { req, res, mock } = createMocks("GET", { lat: "4.71", lon: "-74.07" });
    await handler(req, res);
    expect(mock.statusCode).toBe(500);
    expect(mock.body).toMatchObject({ error: { code: "INVALID_API_KEY" } });
  });
});
