import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getForecast } from "./forecastService";

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
  list: [
    {
      dt: 1_704_067_200,
      dt_txt: "2024-01-01 00:00:00",
      main: {
        temp: 15,
        feels_like: 14,
        temp_min: 13,
        temp_max: 17,
        humidity: 70,
        pressure: 1012,
      },
      weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
      clouds: { all: 80 },
      wind: { speed: 4, deg: 90 },
      pop: 0.4,
      rain: { "3h": 1.5 },
      sys: { pod: "n" },
    },
  ],
  city: {
    id: 1,
    name: "Bogotá",
    coord: { lat: 4.71, lon: -74.07 },
    country: "CO",
    timezone: -18000,
    sunrise: 1_700_000_000,
    sunset: 1_700_050_000,
  },
};

describe("getForecast", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fans out current + forecast in parallel and reshapes them into the contract", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(currentPayload))
      .mockResolvedValueOnce(jsonResponse(forecastPayload));

    const result = await getForecast({
      location: { type: "coords", lat: 4.71, lon: -74.07 },
      apiKey: "key",
      fetchImpl: fetchMock as unknown as typeof fetch,
      now: new Date(1_704_067_200 * 1000),
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.location.name).toBe("Bogotá");
    expect(result.current.temperature.current).toBe(22);
    expect(result.daily).toHaveLength(1);
    expect(result.daily[0].condition.code).toBe(500);
    expect(result.daily[0].precipitation.rainMm).toBeCloseTo(1.5);
  });

  it("propagates a 404 from OpenWeather as LOCATION_NOT_FOUND", async () => {
    fetchMock.mockResolvedValue(new Response("not found", { status: 404 }));

    await expect(
      getForecast({
        location: { type: "name", value: "Atlantis" },
        apiKey: "key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "LOCATION_NOT_FOUND" });
  });
});
