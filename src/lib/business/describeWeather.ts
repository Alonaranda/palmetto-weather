import type { WeatherSignal } from "./weatherToPokemonType";

/**
 * Short descriptors derived from the current observation. Used by the UI
 * to show concise chips like "rainy", "hot", "windy" alongside the Pokémon
 * companion. Order is stable so the rendered output is deterministic.
 */
export function describeWeather(signal: WeatherSignal): string[] {
  const { conditionId, tempCelsius, windMetersPerSecond, isDaytime } = signal;
  const tags: string[] = [];

  // Sky / precipitation comes from the OpenWeather condition code.
  if (conditionId >= 200 && conditionId < 300) tags.push("stormy");
  else if (conditionId >= 300 && conditionId < 400) tags.push("drizzly");
  else if (conditionId >= 500 && conditionId < 600) tags.push("rainy");
  else if (conditionId >= 600 && conditionId < 700) tags.push("snowy");
  else if (conditionId >= 700 && conditionId < 800) tags.push("foggy");
  else if (conditionId === 800) tags.push(isDaytime ? "sunny" : "clear");
  else if (conditionId > 800 && conditionId < 900) tags.push("cloudy");

  // Temperature bands (Celsius). Kept narrow so a city only earns one.
  if (tempCelsius >= 32) tags.push("scorching");
  else if (tempCelsius >= 26) tags.push("hot");
  else if (tempCelsius >= 18) tags.push("warm");
  else if (tempCelsius >= 10) tags.push("mild");
  else if (tempCelsius >= 0) tags.push("cold");
  else tags.push("freezing");

  // Wind, only when noteworthy.
  if (windMetersPerSecond >= 14) tags.push("gusty");
  else if (windMetersPerSecond >= 8) tags.push("breezy");

  if (!isDaytime) tags.push("nighttime");

  return tags;
}
