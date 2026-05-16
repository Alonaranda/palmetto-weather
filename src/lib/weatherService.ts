import { describeWeather } from "./business/describeWeather";
import { isDaytime, weatherToPokemonType } from "./business/weatherToPokemonType";
import type { PokemonCompanion, WeatherSnapshot, WeatherWithCompanion } from "./contracts";
import type { FetchLike } from "./http";
import { type OpenWeatherResponse, type Units, fetchCurrentWeather } from "./services/openweather";
import {
  type PokeApiPokemonResponse,
  type PokemonType,
  fetchRandomPokemonOfType,
} from "./services/pokeapi";

const OPENWEATHER_ICON_BASE = "https://openweathermap.org/img/wn";

export interface GetWeatherWithCompanionParams {
  location: string;
  apiKey: string;
  units?: Units;
  fetchImpl?: FetchLike;
  signal?: AbortSignal;
}

/**
 * Orchestrates the two upstream calls (weather → companion) and reshapes
 * the result into the public contract. Centralising it here keeps the
 * Next.js API route thin and easy to test in isolation.
 */
export async function getWeatherWithCompanion(
  params: GetWeatherWithCompanionParams,
): Promise<WeatherWithCompanion> {
  const { location, apiKey, units = "metric", fetchImpl, signal } = params;

  const weather = await fetchCurrentWeather({
    location: { type: "name", value: location },
    apiKey,
    units,
    fetchImpl,
    signal,
  });
  const snapshot = mapWeather(weather, units);

  const signal_ = {
    conditionId: weather.weather[0]?.id ?? 800,
    tempCelsius: units === "metric" ? weather.main.temp : toCelsius(weather.main.temp, units),
    windMetersPerSecond: units === "imperial" ? weather.wind.speed * 0.44704 : weather.wind.speed,
    isDaytime: snapshot.isDaytime,
  };
  const match = weatherToPokemonType(signal_);
  const descriptors = describeWeather(signal_);

  // No seed → a fresh Pokémon on every lookup, even when the conditions
  // barely changed. Keeps the experience playful and rewards re-searching.
  const pokemon = await fetchRandomPokemonOfType({
    type: match.type,
    fetchImpl,
    signal,
  });

  const companion: PokemonCompanion = {
    type: match.type,
    reason: match.reason,
    descriptors,
    name: pokemon.name,
    spriteUrl: pickSprite(pokemon),
    pokedexNumber: pokemon.id,
    pokemonTypes: pokemon.types.map((t) => t.type.name as PokemonType),
  };

  return { weather: snapshot, companion };
}

export function mapWeather(raw: OpenWeatherResponse, units: Units): WeatherSnapshot {
  const condition = raw.weather[0] ?? {
    id: 800,
    main: "Clear",
    description: "clear sky",
    icon: "01d",
  };

  return {
    location: {
      name: raw.name,
      country: raw.sys.country,
      coordinates: { lat: raw.coord.lat, lon: raw.coord.lon },
    },
    observedAt: new Date(raw.dt * 1000).toISOString(),
    conditions: {
      code: condition.id,
      label: condition.main,
      description: condition.description,
      iconUrl: `${OPENWEATHER_ICON_BASE}/${condition.icon}@2x.png`,
    },
    temperature: {
      current: raw.main.temp,
      feelsLike: raw.main.feels_like,
      min: raw.main.temp_min,
      max: raw.main.temp_max,
      unit: units === "imperial" ? "F" : "C",
    },
    wind: {
      speed: raw.wind.speed,
      unit: units === "imperial" ? "mph" : "m/s",
    },
    humidity: raw.main.humidity,
    isDaytime: isDaytime(raw.dt, raw.sys.sunrise, raw.sys.sunset),
  };
}

function pickSprite(pokemon: PokeApiPokemonResponse): string {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    ""
  );
}

export function toCelsius(value: number, units: Units): number {
  if (units === "imperial") return (value - 32) * (5 / 9);
  if (units === "standard") return value - 273.15;
  return value;
}
