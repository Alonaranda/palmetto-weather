import { describe, expect, it } from "vitest";
import type { OpenWeatherForecastResponse } from "../services/openweather";
import { groupForecastByDay } from "./groupForecastByDay";

function makeEntry(overrides: {
  dt: number;
  temp?: number;
  pop?: number;
  rain3h?: number;
  snow3h?: number;
  wind?: number;
  humidity?: number;
  pressure?: number;
  weather?: { id: number; main: string; description: string; icon: string };
}) {
  const {
    dt,
    temp = 20,
    pop = 0,
    rain3h,
    snow3h,
    wind = 3,
    humidity = 60,
    pressure = 1015,
    weather = { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
  } = overrides;
  return {
    dt,
    dt_txt: new Date(dt * 1000).toISOString(),
    main: {
      temp,
      feels_like: temp,
      temp_min: temp - 2,
      temp_max: temp + 2,
      humidity,
      pressure,
    },
    weather: [weather],
    clouds: { all: 0 },
    wind: { speed: wind, deg: 0 },
    pop,
    rain: rain3h !== undefined ? { "3h": rain3h } : undefined,
    snow: snow3h !== undefined ? { "3h": snow3h } : undefined,
    sys: { pod: "d" as const },
  };
}

function makeForecast(entries: ReturnType<typeof makeEntry>[]): OpenWeatherForecastResponse {
  return {
    list: entries,
    city: {
      id: 1,
      name: "Test",
      coord: { lat: 0, lon: 0 },
      country: "TT",
      timezone: 0,
      sunrise: 0,
      sunset: 0,
    },
  };
}

describe("groupForecastByDay", () => {
  it("aggregates min/max temperature, max wind and max precipitation probability per day", () => {
    const day1 = 1_704_067_200; // 2024-01-01 00:00:00 UTC
    const forecast = makeForecast([
      makeEntry({ dt: day1, temp: 15, pop: 0.2, wind: 2 }),
      makeEntry({ dt: day1 + 3 * 3600, temp: 22, pop: 0.6, wind: 7 }),
      makeEntry({ dt: day1 + 6 * 3600, temp: 18, pop: 0.4, wind: 5 }),
    ]);

    const result = groupForecastByDay(forecast, { now: new Date(day1 * 1000) });

    expect(result).toHaveLength(1);
    expect(result[0].temperature.min).toBeCloseTo(13);
    expect(result[0].temperature.max).toBeCloseTo(24);
    expect(result[0].precipitation.probability).toBeCloseTo(0.6);
    expect(result[0].wind.maxSpeed).toBeCloseTo(7);
  });

  it("sums rain and snow amounts across the day", () => {
    const day1 = 1_704_067_200;
    const forecast = makeForecast([
      makeEntry({ dt: day1, rain3h: 1.2 }),
      makeEntry({ dt: day1 + 3 * 3600, rain3h: 0.8 }),
      makeEntry({ dt: day1 + 6 * 3600, snow3h: 2 }),
    ]);

    const [day] = groupForecastByDay(forecast, { now: new Date(day1 * 1000) });

    expect(day.precipitation.rainMm).toBeCloseTo(2);
    expect(day.precipitation.snowMm).toBeCloseTo(2);
  });

  it("uses the dominant condition for the day", () => {
    const day1 = 1_704_067_200;
    const forecast = makeForecast([
      makeEntry({
        dt: day1,
        weather: { id: 500, main: "Rain", description: "light rain", icon: "10d" },
      }),
      makeEntry({
        dt: day1 + 3 * 3600,
        weather: { id: 500, main: "Rain", description: "light rain", icon: "10d" },
      }),
      makeEntry({
        dt: day1 + 6 * 3600,
        weather: { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
      }),
    ]);

    const [day] = groupForecastByDay(forecast, { now: new Date(day1 * 1000) });

    expect(day.condition.code).toBe(500);
    expect(day.condition.iconUrl).toContain("10d@2x.png");
  });

  it("labels today and tomorrow explicitly", () => {
    const day1 = 1_704_067_200; // 2024-01-01
    const day2 = day1 + 24 * 3600;
    const forecast = makeForecast([makeEntry({ dt: day1 }), makeEntry({ dt: day2 })]);

    const result = groupForecastByDay(forecast, { now: new Date(day1 * 1000) });

    expect(result[0].dayLabel).toBe("Today");
    expect(result[1].dayLabel).toBe("Tomorrow");
  });

  it("returns days sorted ascending", () => {
    const day1 = 1_704_067_200;
    const day3 = day1 + 2 * 24 * 3600;
    const day2 = day1 + 24 * 3600;
    const forecast = makeForecast([
      makeEntry({ dt: day3 }),
      makeEntry({ dt: day1 }),
      makeEntry({ dt: day2 }),
    ]);

    const result = groupForecastByDay(forecast, { now: new Date(day1 * 1000) });
    expect(result.map((d) => d.date)).toEqual([result[0].date, result[1].date, result[2].date]);
    expect(result[0].date < result[1].date).toBe(true);
    expect(result[1].date < result[2].date).toBe(true);
  });
});
