import type { DailyForecast } from "./business/groupForecastByDay";
import type { ApiErrorCode } from "./errors";
import type { PokemonType } from "./services/pokeapi";

/**
 * Public contract returned by the BFF `/api/weather` endpoint.
 * Keeping this file vendor-agnostic means the UI never has to know whether
 * the data came from OpenWeather, PokeAPI, or a future provider.
 */
export interface WeatherSnapshot {
  location: {
    name: string;
    country?: string;
    coordinates: { lat: number; lon: number };
  };
  observedAt: string;
  conditions: {
    code: number;
    label: string;
    description: string;
    iconUrl: string;
  };
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
    unit: "C" | "F";
  };
  wind: {
    speed: number;
    unit: "m/s" | "mph";
  };
  humidity: number;
  isDaytime: boolean;
}

export interface PokemonCompanion {
  type: PokemonType;
  reason: string;
  /** Short tags such as "rainy", "hot", "windy" derived from the conditions. */
  descriptors: string[];
  name: string;
  spriteUrl: string;
  pokedexNumber: number;
  pokemonTypes: PokemonType[];
}

export interface WeatherWithCompanion {
  weather: WeatherSnapshot;
  companion: PokemonCompanion;
}

/**
 * Forecast contract returned by the BFF `/api/forecast` endpoint. Bundles the
 * current observation with a daily summary so the UI can render the hero and
 * the weekly list with one request.
 */
export interface ForecastResponse {
  current: WeatherSnapshot;
  daily: DailyForecast[];
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    source?: string;
  };
}
