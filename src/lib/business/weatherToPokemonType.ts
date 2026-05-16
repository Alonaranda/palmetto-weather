import type { PokemonType } from "../services/pokeapi";

/**
 * Inputs we need from the upstream weather payload to decide a Pokémon type.
 * Decoupled from the OpenWeather response shape so the rule can be unit-tested
 * in isolation and reused with another provider.
 *
 * Reference for OpenWeather condition codes:
 * https://openweathermap.org/weather-conditions
 */
export interface WeatherSignal {
  /** OpenWeather condition code (e.g. 200, 500, 800). */
  conditionId: number;
  /** Temperature in Celsius. */
  tempCelsius: number;
  /** Wind speed in m/s. */
  windMetersPerSecond: number;
  /** Whether the observation occurred between sunrise and sunset (local). */
  isDaytime: boolean;
}

export interface PokemonMatch {
  type: PokemonType;
  /** Short, human-readable reason — surfaced in the UI to explain the pairing. */
  reason: string;
}

const COLD_CELSIUS = 5;
const HOT_CELSIUS = 28;
const STRONG_WIND_MPS = 10;

/**
 * Pick a Pokémon elemental type that thematically matches the current
 * conditions. The logic is deliberately explicit (no lookup table) so the
 * narrative can be surfaced to the user and tweaked per business intent.
 */
export function weatherToPokemonType(signal: WeatherSignal): PokemonMatch {
  const { conditionId, tempCelsius, windMetersPerSecond, isDaytime } = signal;

  // Thunderstorm (2xx)
  if (conditionId >= 200 && conditionId < 300) {
    return { type: "electric", reason: "Thunderstorms in the sky — Electric energy in the air" };
  }

  // Drizzle (3xx) + Rain (5xx)
  if ((conditionId >= 300 && conditionId < 400) || (conditionId >= 500 && conditionId < 600)) {
    return { type: "water", reason: "Rain is falling — a Water companion fits the mood" };
  }

  // Snow (6xx)
  if (conditionId >= 600 && conditionId < 700) {
    return { type: "ice", reason: "Snow on the ground — bring an Ice friend" };
  }

  // Atmosphere (7xx): mist, smoke, haze, fog, dust, sand, ash, squall, tornado
  if (conditionId >= 700 && conditionId < 800) {
    return { type: "ghost", reason: "Hazy and mysterious — Ghost types love this weather" };
  }

  // Strong wind overrides clear/clouds for a Flying pairing
  if (windMetersPerSecond >= STRONG_WIND_MPS) {
    return { type: "flying", reason: "Strong winds — a Flying type rides the gusts" };
  }

  // Clouds (80x — 801..804)
  if (conditionId > 800 && conditionId < 900) {
    return { type: "flying", reason: "Cloudy skies — a Flying type feels at home" };
  }

  // Clear (800)
  if (conditionId === 800) {
    if (!isDaytime) {
      return { type: "dark", reason: "Clear night sky — a Dark type prowls under the stars" };
    }
    if (tempCelsius >= HOT_CELSIUS) {
      return { type: "fire", reason: "Hot and sunny — a Fire type thrives" };
    }
    if (tempCelsius < COLD_CELSIUS) {
      return { type: "ice", reason: "Clear but cold — an Ice type enjoys the chill" };
    }
    return { type: "grass", reason: "Sunny and mild — perfect for a Grass type" };
  }

  // Defensive fallback for unknown future codes
  return { type: "normal", reason: "Calm conditions — a Normal type joins you" };
}

/**
 * Compute whether an observation is during local daytime, given a Unix
 * timestamp `dt` and the sunrise/sunset times exposed by OpenWeather.
 */
export function isDaytime(dt: number, sunrise: number, sunset: number): boolean {
  return dt >= sunrise && dt < sunset;
}
