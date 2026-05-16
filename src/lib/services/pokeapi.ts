import { ApiError } from "../errors";
import { type FetchLike, UpstreamHttpError, getJson } from "../http";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Subset of the PokeAPI type endpoint we rely on.
 * Reference: https://pokeapi.co/docs/v2#type
 */
export interface PokeApiTypeResponse {
  id: number;
  name: string;
  pokemon: Array<{ slot: number; pokemon: { name: string; url: string } }>;
}

/**
 * Subset of the PokeAPI pokemon endpoint we rely on.
 * Reference: https://pokeapi.co/docs/v2#pokemon
 */
export interface PokeApiPokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
      home?: { front_default: string | null };
    };
  };
  types: Array<{ slot: number; type: { name: string } }>;
}

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export interface FetchPokemonByTypeParams {
  type: PokemonType;
  /** Optional integer seed so the same weather call surfaces the same companion within a session. */
  seed?: number;
  fetchImpl?: FetchLike;
  signal?: AbortSignal;
}

/**
 * Pick a Pokémon of the given elemental type. We fetch the list of all
 * Pokémon for the type, choose one (seeded or random) and then resolve the
 * detail endpoint to obtain sprites + metadata. Both calls are made via
 * direct REST against the PokeAPI documented routes.
 */
export async function fetchRandomPokemonOfType(
  params: FetchPokemonByTypeParams,
): Promise<PokeApiPokemonResponse> {
  const { type, seed, fetchImpl, signal } = params;

  let typeIndex: PokeApiTypeResponse;
  try {
    typeIndex = await getJson<PokeApiTypeResponse>(`${POKEAPI_BASE_URL}/type/${type}`, {
      fetchImpl,
      signal,
    });
  } catch (err) {
    throw wrapPokeApiError(err, `Unable to load Pokémon for type ${type}`);
  }

  if (typeIndex.pokemon.length === 0) {
    throw new ApiError("INVALID_RESPONSE", `No Pokémon available for type ${type}`, 502, "pokeapi");
  }

  const index =
    typeof seed === "number"
      ? Math.abs(seed) % typeIndex.pokemon.length
      : Math.floor(Math.random() * typeIndex.pokemon.length);
  const entry = typeIndex.pokemon[index];

  try {
    return await getJson<PokeApiPokemonResponse>(entry.pokemon.url, { fetchImpl, signal });
  } catch (err) {
    throw wrapPokeApiError(err, `Unable to load Pokémon "${entry.pokemon.name}"`);
  }
}

function wrapPokeApiError(err: unknown, fallbackMessage: string): ApiError {
  if (err instanceof UpstreamHttpError) {
    if (err.status === 404) {
      return new ApiError("INVALID_RESPONSE", fallbackMessage, 502, "pokeapi");
    }
    if (err.status === 429) {
      return new ApiError("RATE_LIMITED", "PokeAPI rate limit exceeded", 429, "pokeapi");
    }
    return new ApiError(
      "UPSTREAM_UNAVAILABLE",
      `PokeAPI upstream error (${err.status})`,
      502,
      "pokeapi",
    );
  }
  if (err instanceof ApiError) return err;
  return new ApiError("UPSTREAM_UNAVAILABLE", fallbackMessage, 502, "pokeapi");
}
