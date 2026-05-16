import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getWeatherWithCompanion } from "./weatherService";

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
  weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
  main: {
    temp: 17,
    feels_like: 16,
    temp_min: 15,
    temp_max: 19,
    humidity: 80,
    pressure: 1015,
  },
  wind: { speed: 3, deg: 90 },
  clouds: { all: 75 },
};

const pokeTypeIndex = {
  id: 11,
  name: "water",
  pokemon: [
    { slot: 1, pokemon: { name: "squirtle", url: "https://pokeapi.co/api/v2/pokemon/7/" } },
  ],
};

const pokemonDetail = {
  id: 7,
  name: "squirtle",
  height: 5,
  weight: 90,
  sprites: {
    front_default: "https://example/squirtle.png",
    other: {
      "official-artwork": { front_default: "https://example/squirtle-art.png" },
    },
  },
  types: [{ slot: 1, type: { name: "water" } }],
};

describe("getWeatherWithCompanion", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("orchestrates OpenWeather + PokeAPI and returns the contract", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(openWeatherPayload))
      .mockResolvedValueOnce(jsonResponse(pokeTypeIndex))
      .mockResolvedValueOnce(jsonResponse(pokemonDetail));

    const result = await getWeatherWithCompanion({
      location: "Bogotá",
      apiKey: "key",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result.weather.location.name).toBe("Bogotá");
    expect(result.weather.location.country).toBe("CO");
    expect(result.weather.conditions.code).toBe(500);
    expect(result.weather.conditions.iconUrl).toMatch(/10d@2x.png$/);
    expect(result.weather.temperature.unit).toBe("C");

    expect(result.companion.type).toBe("water");
    expect(result.companion.name).toBe("squirtle");
    expect(result.companion.spriteUrl).toBe("https://example/squirtle-art.png");
    expect(result.companion.reason).toMatch(/water/i);
  });

  it("propagates a typed ApiError when OpenWeather returns 404", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not found", { status: 404 }));

    await expect(
      getWeatherWithCompanion({
        location: "Atlantis",
        apiKey: "key",
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "LOCATION_NOT_FOUND" });
  });

  it("converts imperial wind speed to m/s for the rule input", async () => {
    const imperialPayload = {
      ...openWeatherPayload,
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      main: { ...openWeatherPayload.main, temp: 90 },
      wind: { speed: 30, deg: 90 },
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse(imperialPayload))
      .mockResolvedValueOnce(
        jsonResponse({
          id: 3,
          name: "flying",
          pokemon: [
            {
              slot: 1,
              pokemon: { name: "pidgey", url: "https://pokeapi.co/api/v2/pokemon/16/" },
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          ...pokemonDetail,
          id: 16,
          name: "pidgey",
          types: [{ slot: 1, type: { name: "flying" } }],
        }),
      );

    const result = await getWeatherWithCompanion({
      location: "Anywhere",
      apiKey: "key",
      units: "imperial",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result.weather.temperature.unit).toBe("F");
    expect(result.weather.wind.unit).toBe("mph");
    // 30 mph ≈ 13.4 m/s, above the STRONG_WIND_MPS threshold → flying
    expect(result.companion.type).toBe("flying");
  });
});
