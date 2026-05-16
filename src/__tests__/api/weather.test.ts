import handler from "@/pages/api/weather";
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

const openWeatherPayload = {
  name: "Bogotá",
  sys: { country: "CO", sunrise: 1_700_000_000, sunset: 1_700_050_000 },
  coord: { lat: 4.71, lon: -74.07 },
  dt: 1_700_020_000,
  timezone: -18000,
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  main: {
    temp: 22,
    feels_like: 21,
    temp_min: 20,
    temp_max: 24,
    humidity: 60,
    pressure: 1015,
  },
  wind: { speed: 2, deg: 90 },
  clouds: { all: 10 },
};

const pokeTypeIndex = {
  id: 12,
  name: "grass",
  pokemon: [
    { slot: 1, pokemon: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" } },
  ],
};

const pokemonDetail = {
  id: 1,
  name: "bulbasaur",
  height: 7,
  weight: 69,
  sprites: { front_default: "https://example/bulba.png" },
  types: [{ slot: 1, type: { name: "grass" } }],
};

describe("GET /api/weather", () => {
  const originalKey = process.env.OPENWEATHER_API_KEY;

  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.OPENWEATHER_API_KEY = originalKey;
  });

  it("returns the combined contract on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(openWeatherPayload))
        .mockResolvedValueOnce(jsonResponse(pokeTypeIndex))
        .mockResolvedValueOnce(jsonResponse(pokemonDetail)),
    );

    const { req, res, mock } = createMocks("GET", { location: "Bogotá" });
    await handler(req, res);

    expect(mock.statusCode).toBe(200);
    expect(mock.headers["cache-control"]).toContain("s-maxage=300");
    expect(mock.body).toMatchObject({
      weather: { location: { name: "Bogotá" } },
      companion: { name: "bulbasaur", type: "grass" },
    });
  });

  it("rejects non-GET methods with 405", async () => {
    const { req, res, mock } = createMocks("POST", { location: "Bogotá" });
    await handler(req, res);
    expect(mock.statusCode).toBe(405);
  });

  it("returns 400 when location is missing", async () => {
    const { req, res, mock } = createMocks("GET", {});
    await handler(req, res);
    expect(mock.statusCode).toBe(400);
    expect(mock.body).toMatchObject({ error: { code: "BAD_REQUEST" } });
  });

  it("returns 500 with INVALID_API_KEY code when the env var is missing", async () => {
    process.env.OPENWEATHER_API_KEY = "";
    const { req, res, mock } = createMocks("GET", { location: "Bogotá" });
    await handler(req, res);
    expect(mock.statusCode).toBe(500);
    expect(mock.body).toMatchObject({ error: { code: "INVALID_API_KEY" } });
  });

  it("forwards a 404 from OpenWeather as LOCATION_NOT_FOUND", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response("not found", { status: 404 })),
    );

    const { req, res, mock } = createMocks("GET", { location: "Atlantis" });
    await handler(req, res);

    expect(mock.statusCode).toBe(404);
    expect(mock.body).toMatchObject({ error: { code: "LOCATION_NOT_FOUND" } });
  });
});
