import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRandomPokemonOfType } from "./pokeapi";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

const typeIndex = {
  id: 11,
  name: "water",
  pokemon: [
    { slot: 1, pokemon: { name: "squirtle", url: "https://pokeapi.co/api/v2/pokemon/7/" } },
    { slot: 1, pokemon: { name: "psyduck", url: "https://pokeapi.co/api/v2/pokemon/54/" } },
  ],
};

const squirtleDetail = {
  id: 7,
  name: "squirtle",
  height: 5,
  weight: 90,
  sprites: { front_default: "https://example/sprite.png" },
  types: [{ slot: 1, type: { name: "water" } }],
};

describe("fetchRandomPokemonOfType", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("queries the type endpoint then resolves a member detail", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(typeIndex))
      .mockResolvedValueOnce(jsonResponse(squirtleDetail));

    const result = await fetchRandomPokemonOfType({
      type: "water",
      seed: 0,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://pokeapi.co/api/v2/type/water");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://pokeapi.co/api/v2/pokemon/7/");
    expect(result.name).toBe("squirtle");
  });

  it("uses the seed to pick a deterministic index", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(typeIndex))
      .mockResolvedValueOnce(jsonResponse({ ...squirtleDetail, name: "psyduck", id: 54 }));

    const result = await fetchRandomPokemonOfType({
      type: "water",
      seed: 1,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://pokeapi.co/api/v2/pokemon/54/");
    expect(result.name).toBe("psyduck");
  });

  it("raises a domain ApiError when the type list is empty", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 11, name: "water", pokemon: [] }));

    await expect(
      fetchRandomPokemonOfType({
        type: "water",
        seed: 0,
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE", source: "pokeapi" });
  });

  it("maps a 429 from PokeAPI to RATE_LIMITED", async () => {
    fetchMock.mockResolvedValueOnce(new Response("slow down", { status: 429 }));

    await expect(
      fetchRandomPokemonOfType({
        type: "fire",
        seed: 0,
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });
});
