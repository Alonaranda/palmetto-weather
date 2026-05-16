import { describe, expect, it } from "vitest";
import { isDaytime, weatherToPokemonType } from "./weatherToPokemonType";

describe("weatherToPokemonType", () => {
  const baseSignal = { tempCelsius: 20, windMetersPerSecond: 2, isDaytime: true };

  it("maps thunderstorm (2xx) to electric", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 211 }).type).toBe("electric");
  });

  it("maps drizzle (3xx) to water", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 301 }).type).toBe("water");
  });

  it("maps rain (5xx) to water", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 502 }).type).toBe("water");
  });

  it("maps snow (6xx) to ice", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 601 }).type).toBe("ice");
  });

  it("maps atmosphere (7xx, fog/haze) to ghost", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 741 }).type).toBe("ghost");
  });

  it("maps clouds (80x) to flying", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 803 }).type).toBe("flying");
  });

  it("maps clear hot day to fire", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 800, tempCelsius: 32 }).type).toBe(
      "fire",
    );
  });

  it("maps clear cold day to ice", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 800, tempCelsius: -2 }).type).toBe(
      "ice",
    );
  });

  it("maps clear mild day to grass", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 800, tempCelsius: 22 }).type).toBe(
      "grass",
    );
  });

  it("maps clear night to dark", () => {
    expect(
      weatherToPokemonType({
        ...baseSignal,
        conditionId: 800,
        tempCelsius: 22,
        isDaytime: false,
      }).type,
    ).toBe("dark");
  });

  it("prefers flying when wind is strong, regardless of clear sky", () => {
    expect(
      weatherToPokemonType({
        ...baseSignal,
        conditionId: 800,
        windMetersPerSecond: 15,
      }).type,
    ).toBe("flying");
  });

  it("does NOT override storm with strong wind (storm takes precedence)", () => {
    expect(
      weatherToPokemonType({
        ...baseSignal,
        conditionId: 211,
        windMetersPerSecond: 15,
      }).type,
    ).toBe("electric");
  });

  it("falls back to normal for unrecognised codes", () => {
    expect(weatherToPokemonType({ ...baseSignal, conditionId: 999 }).type).toBe("normal");
  });

  it("returns a non-empty reason for every branch", () => {
    const samples = [211, 301, 500, 601, 741, 800, 803, 999];
    for (const conditionId of samples) {
      const result = weatherToPokemonType({ ...baseSignal, conditionId });
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });
});

describe("isDaytime", () => {
  it("returns true when dt is between sunrise and sunset", () => {
    expect(isDaytime(150, 100, 200)).toBe(true);
  });

  it("returns false before sunrise", () => {
    expect(isDaytime(50, 100, 200)).toBe(false);
  });

  it("returns false after sunset", () => {
    expect(isDaytime(250, 100, 200)).toBe(false);
  });

  it("treats the sunset boundary as night (exclusive)", () => {
    expect(isDaytime(200, 100, 200)).toBe(false);
  });
});
