import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../errors";
import { fetchCurrentWeather, fetchForecast } from "./openweather";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

describe("fetchCurrentWeather", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds the request URL with the documented query params for a named location", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ name: "Bogotá" }));

    await fetchCurrentWeather({
      location: { type: "name", value: " Bogotá " },
      apiKey: "key-123",
      fetchImpl: fetchMock as unknown as typeof fetch,
    }).catch(() => undefined);

    const requestedUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    expect(requestedUrl.origin + requestedUrl.pathname).toBe(
      "https://api.openweathermap.org/data/2.5/weather",
    );
    expect(requestedUrl.searchParams.get("q")).toBe("Bogotá");
    expect(requestedUrl.searchParams.get("appid")).toBe("key-123");
    expect(requestedUrl.searchParams.get("units")).toBe("metric");
    expect(requestedUrl.searchParams.get("lang")).toBe("en");
  });

  it("uses lat / lon when location is coordinates", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ name: "Bogotá" }));

    await fetchCurrentWeather({
      location: { type: "coords", lat: 4.71, lon: -74.07 },
      apiKey: "key",
      fetchImpl: fetchMock as unknown as typeof fetch,
    }).catch(() => undefined);

    const requestedUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    expect(requestedUrl.searchParams.get("lat")).toBe("4.71");
    expect(requestedUrl.searchParams.get("lon")).toBe("-74.07");
    expect(requestedUrl.searchParams.get("q")).toBeNull();
  });

  it("returns the parsed payload on 200", async () => {
    const payload = { name: "Bogotá", main: { temp: 18 } };
    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await fetchCurrentWeather({
      location: { type: "name", value: "Bogotá" },
      apiKey: "key",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result).toEqual(payload);
  });

  it("maps 404 to LOCATION_NOT_FOUND", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not found", { status: 404 }));

    await expect(
      fetchCurrentWeather({
        location: { type: "name", value: "Atlantis" },
        apiKey: "key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "LOCATION_NOT_FOUND", status: 404 });
  });

  it("maps 401 to INVALID_API_KEY", async () => {
    fetchMock.mockResolvedValueOnce(new Response("invalid", { status: 401 }));

    await expect(
      fetchCurrentWeather({
        location: { type: "name", value: "Bogotá" },
        apiKey: "bad-key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "INVALID_API_KEY", status: 401 });
  });

  it("maps 429 to RATE_LIMITED", async () => {
    fetchMock.mockResolvedValueOnce(new Response("slow down", { status: 429 }));

    await expect(
      fetchCurrentWeather({
        location: { type: "name", value: "Bogotá" },
        apiKey: "key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "RATE_LIMITED", status: 429 });
  });

  it("rejects when the API key is missing", async () => {
    await expect(
      fetchCurrentWeather({
        location: { type: "name", value: "Bogotá" },
        apiKey: "",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects when the named location is empty after trimming", async () => {
    await expect(
      fetchCurrentWeather({
        location: { type: "name", value: "   " },
        apiKey: "key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects when coordinates are not finite", async () => {
    await expect(
      fetchCurrentWeather({
        location: { type: "coords", lat: Number.NaN, lon: 0 },
        apiKey: "key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("fetchForecast", () => {
  it("hits the documented forecast endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ list: [], city: {} }));

    await fetchForecast({
      location: { type: "coords", lat: 4.71, lon: -74.07 },
      apiKey: "key",
      fetchImpl: fetchMock as unknown as typeof fetch,
    }).catch(() => undefined);

    const requestedUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    expect(requestedUrl.pathname).toBe("/data/2.5/forecast");
  });
});
