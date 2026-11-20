import { describe, expect, it } from "vitest";
import { parseWeather, weatherCondition } from "@/lib/weather";

const response = {
  timezone: "Europe/Madrid",
  current: { time: "2026-11-13T19:45", temperature_2m: 15.5, weather_code: 2, wind_speed_10m: 1.3 },
  daily: {
    time: ["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"],
    weather_code: [61, 61, 61, 45],
    temperature_2m_max: [18.3, 20, 14.8, 20.3],
    temperature_2m_min: [12.9, 11.5, 10.5, 7.8],
    precipitation_probability_max: [23, 30, 56, 18],
  },
};

describe("Live weather data", () => {
  it("preserves real provider temperatures, wind and each daily rain probability", () => {
    const result = parseWeather(response);
    expect(result.current).toEqual({
      time: "2026-11-13T19:45",
      temperature: 15.5,
      code: 2,
      wind: 1.3,
    });
    expect(result.days[2]).toEqual({
      date: "2026-11-15",
      code: 61,
      max: 14.8,
      min: 10.5,
      rain: 56,
    });
  });
  it("rejects incomplete forecasts instead of displaying fabricated temperatures", () => {
    expect(() =>
      parseWeather({ ...response, daily: { ...response.daily, temperature_2m_max: [18.3] } }),
    ).toThrow();
  });
  it("uses WMO precipitation codes for rain, snow and storms", () => {
    expect(weatherCondition(61).kind).toBe("rain");
    expect(weatherCondition(71).kind).toBe("snow");
    expect(weatherCondition(95).kind).toBe("storm");
  });
});
