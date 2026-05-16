import type { DailyForecast } from "./groupForecastByDay";

/**
 * One actionable suggestion attached to a day. The icon is an emoji so the
 * UI does not need to ship an icon font for this small feature.
 */
export interface RecommendedItem {
  id: string;
  icon: string;
  label: string;
  reason: string;
}

export interface DayRecommendation {
  date: string;
  dayLabel: string;
  weekday: string;
  headline: string;
  items: RecommendedItem[];
}

const RAIN_PROBABILITY_THRESHOLD = 0.4;
const HEAVY_RAIN_MM = 5;
const HOT_CELSIUS = 26;
const SCORCHING_CELSIUS = 32;
const COLD_CELSIUS = 5;
const FREEZING_CELSIUS = 0;
const STRONG_WIND_MPS = 10;
const LAYER_DELTA_CELSIUS = 12;

/**
 * Generates clothing + accessory recommendations for each day of the
 * forecast. The logic is intentionally explicit (no lookup table) so the
 * rationale we surface to the user maps 1:1 with a rule the product team
 * can audit later.
 *
 * Inputs are assumed to be in Celsius / m/s (the metric output of our
 * BFF). When the user toggles to imperial, we still run the rules in
 * metric — the recommendations themselves are unit-agnostic.
 */
export function generateRecommendations(
  days: DailyForecast[],
  options: { temperatureUnit?: "C" | "F" } = {},
): DayRecommendation[] {
  const unit = options.temperatureUnit ?? "C";
  return days.map((day) => buildForDay(day, unit));
}

function buildForDay(day: DailyForecast, unit: "C" | "F"): DayRecommendation {
  const items: RecommendedItem[] = [];

  const tempMaxC = unit === "F" ? toCelsius(day.temperature.max) : day.temperature.max;
  const tempMinC = unit === "F" ? toCelsius(day.temperature.min) : day.temperature.min;

  const probability = day.precipitation.probability;
  const rainMm = day.precipitation.rainMm;
  const snowMm = day.precipitation.snowMm;
  const maxWind = day.wind.maxSpeed;

  if (snowMm > 0) {
    items.push({
      id: "boots",
      icon: "🥾",
      label: "Snow boots",
      reason: `${snowMm.toFixed(1)} mm of snow expected`,
    });
    items.push({ id: "gloves", icon: "🧤", label: "Gloves & beanie", reason: "Snowy day ahead" });
  }

  if (probability >= RAIN_PROBABILITY_THRESHOLD || rainMm >= 1) {
    items.push({
      id: "umbrella",
      icon: "☂️",
      label: "Umbrella",
      reason: `${Math.round(probability * 100)}% chance of rain`,
    });
  }

  if (rainMm >= HEAVY_RAIN_MM) {
    items.push({
      id: "waterproof",
      icon: "🥾",
      label: "Waterproof shoes",
      reason: `Heavy rain (~${rainMm.toFixed(1)} mm)`,
    });
  }

  if (tempMaxC >= SCORCHING_CELSIUS) {
    items.push({
      id: "sunscreen",
      icon: "🧴",
      label: "Sunscreen",
      reason: `Highs around ${Math.round(day.temperature.max)}°${unit}`,
    });
    items.push({
      id: "hydrate",
      icon: "💧",
      label: "Stay hydrated",
      reason: "Scorching day — carry a water bottle",
    });
  }

  if (tempMaxC >= HOT_CELSIUS) {
    items.push({
      id: "light-clothes",
      icon: "👕",
      label: "Light, breathable clothes",
      reason: `Warm day (${Math.round(day.temperature.max)}°${unit})`,
    });
    items.push({
      id: "sunglasses",
      icon: "🕶️",
      label: "Sunglasses",
      reason: "Bright outdoor light",
    });
  }

  if (tempMinC <= FREEZING_CELSIUS) {
    items.push({
      id: "heavy-coat",
      icon: "🧥",
      label: "Heavy coat",
      reason: `Freezing low (${Math.round(day.temperature.min)}°${unit})`,
    });
  } else if (tempMinC <= COLD_CELSIUS) {
    items.push({
      id: "warm-coat",
      icon: "🧥",
      label: "Warm coat",
      reason: `Cold morning (${Math.round(day.temperature.min)}°${unit})`,
    });
  }

  if (tempMaxC - tempMinC >= LAYER_DELTA_CELSIUS) {
    items.push({
      id: "layers",
      icon: "🧦",
      label: "Dress in layers",
      reason: `Wide temperature swing (${Math.round(tempMaxC - tempMinC)}°C across the day)`,
    });
  }

  if (maxWind >= STRONG_WIND_MPS) {
    items.push({
      id: "windbreaker",
      icon: "🌬️",
      label: "Windbreaker",
      reason: `Strong wind (~${maxWind.toFixed(1)} m/s)`,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "easy-day",
      icon: "✨",
      label: "No special gear needed",
      reason: "Mild conditions all day",
    });
  }

  return {
    date: day.date,
    dayLabel: day.dayLabel,
    weekday: day.weekday,
    headline: composeHeadline(day, items),
    items,
  };
}

function composeHeadline(day: DailyForecast, items: RecommendedItem[]): string {
  const highlights = items
    .filter((item) => item.id !== "easy-day")
    .slice(0, 2)
    .map((item) => item.label.toLowerCase());
  if (highlights.length === 0) {
    return `${day.dayLabel}: looks chill, no extras needed.`;
  }
  if (highlights.length === 1) {
    return `${day.dayLabel}: bring ${highlights[0]}.`;
  }
  return `${day.dayLabel}: bring ${highlights[0]} and ${highlights[1]}.`;
}

function toCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * (5 / 9);
}
