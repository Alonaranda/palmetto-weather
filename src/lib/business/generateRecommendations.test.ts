import { describe, expect, it } from "vitest";
import { generateRecommendations } from "./generateRecommendations";
import type { DailyForecast } from "./groupForecastByDay";

function makeDay(overrides: Partial<DailyForecast> = {}): DailyForecast {
  return {
    date: "2026-05-16",
    dayLabel: "Today",
    weekday: "Sat",
    condition: {
      code: 800,
      label: "Clear",
      description: "clear sky",
      iconUrl: "https://openweathermap.org/img/wn/01d@2x.png",
    },
    temperature: { min: 18, max: 22 },
    precipitation: { probability: 0, rainMm: 0, snowMm: 0 },
    wind: { maxSpeed: 3 },
    humidityAverage: 50,
    pressureAverage: 1015,
    ...overrides,
  };
}

const ids = (result: ReturnType<typeof generateRecommendations>[number]) =>
  result.items.map((item) => item.id);

describe("generateRecommendations", () => {
  it("recommends an umbrella when rain probability is high", () => {
    const [day] = generateRecommendations([
      makeDay({ precipitation: { probability: 0.7, rainMm: 2, snowMm: 0 } }),
    ]);
    expect(ids(day)).toContain("umbrella");
  });

  it("adds waterproof shoes for heavy rain", () => {
    const [day] = generateRecommendations([
      makeDay({ precipitation: { probability: 0.9, rainMm: 8, snowMm: 0 } }),
    ]);
    expect(ids(day)).toEqual(expect.arrayContaining(["umbrella", "waterproof"]));
  });

  it("recommends sunscreen, sunglasses and hydration for a scorching day", () => {
    const [day] = generateRecommendations([makeDay({ temperature: { min: 24, max: 34 } })]);
    expect(ids(day)).toEqual(
      expect.arrayContaining(["sunscreen", "sunglasses", "hydrate", "light-clothes"]),
    );
  });

  it("recommends a heavy coat when the minimum is below freezing", () => {
    const [day] = generateRecommendations([makeDay({ temperature: { min: -3, max: 4 } })]);
    expect(ids(day)).toContain("heavy-coat");
  });

  it("recommends snow boots and gloves when snow is expected", () => {
    const [day] = generateRecommendations([
      makeDay({
        temperature: { min: -2, max: 2 },
        precipitation: { probability: 0.8, rainMm: 0, snowMm: 3 },
      }),
    ]);
    expect(ids(day)).toEqual(expect.arrayContaining(["boots", "gloves"]));
  });

  it("suggests layers when the temperature swing is wide", () => {
    const [day] = generateRecommendations([makeDay({ temperature: { min: 5, max: 23 } })]);
    expect(ids(day)).toContain("layers");
  });

  it("recommends a windbreaker when the wind is strong", () => {
    const [day] = generateRecommendations([makeDay({ wind: { maxSpeed: 12 } })]);
    expect(ids(day)).toContain("windbreaker");
  });

  it("returns the friendly fallback when conditions are mild", () => {
    const [day] = generateRecommendations([makeDay()]);
    expect(ids(day)).toEqual(["easy-day"]);
    expect(day.headline).toMatch(/chill/i);
  });

  it("composes a useful headline mentioning the first two items", () => {
    const [day] = generateRecommendations([
      makeDay({
        precipitation: { probability: 0.7, rainMm: 2, snowMm: 0 },
        temperature: { min: 18, max: 30 },
      }),
    ]);
    expect(day.headline.toLowerCase()).toContain("today");
    expect(day.headline.toLowerCase()).toMatch(/umbrella|sunscreen|light/);
  });

  it("works when the user is on Fahrenheit (converts internally)", () => {
    // 95°F max ≈ 35°C → scorching path
    const [day] = generateRecommendations([makeDay({ temperature: { min: 70, max: 95 } })], {
      temperatureUnit: "F",
    });
    expect(ids(day)).toContain("sunscreen");
  });
});
