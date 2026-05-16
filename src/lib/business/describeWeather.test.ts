import { describe, expect, it } from "vitest";
import { describeWeather } from "./describeWeather";

describe("describeWeather", () => {
  const base = { tempCelsius: 20, windMetersPerSecond: 2, isDaytime: true };

  it("tags rain conditions as 'rainy'", () => {
    expect(describeWeather({ ...base, conditionId: 500 })).toContain("rainy");
  });

  it("tags clear hot days as 'sunny' and 'hot'", () => {
    const tags = describeWeather({ ...base, conditionId: 800, tempCelsius: 30 });
    expect(tags).toEqual(expect.arrayContaining(["sunny", "hot"]));
  });

  it("tags clear cold nights as 'clear', 'freezing' and 'nighttime'", () => {
    const tags = describeWeather({
      ...base,
      conditionId: 800,
      tempCelsius: -5,
      isDaytime: false,
    });
    expect(tags).toEqual(expect.arrayContaining(["clear", "freezing", "nighttime"]));
  });

  it("adds 'gusty' for very strong wind", () => {
    expect(describeWeather({ ...base, conditionId: 800, windMetersPerSecond: 16 })).toContain(
      "gusty",
    );
  });

  it("does not tag wind when light", () => {
    expect(describeWeather({ ...base, conditionId: 800, windMetersPerSecond: 3 })).not.toContain(
      "gusty",
    );
  });
});
