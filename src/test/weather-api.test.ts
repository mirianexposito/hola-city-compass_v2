import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (callback: () => Promise<unknown>) => callback }),
}));
import { getZaragozaWeather } from "@/lib/weather.functions";

afterEach(() => vi.unstubAllGlobals());

describe("Weather service failures", () => {
  it("keeps plans available when the weather provider is offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await getZaragozaWeather();
    expect(result.forecast).toBeNull();
    expect(result.error).toBeTruthy();
  });
  it("only requests Zaragoza coordinates and no questionnaire answers", async () => {
    const request = vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", request);
    await getZaragozaWeather();
    const url = request.mock.calls[0]?.[0];
    expect(url).toBeInstanceOf(URL);
    expect(url.searchParams.get("latitude")).toBe("41.6488");
    expect(url.searchParams.get("longitude")).toBe("-0.8891");
    expect(url.searchParams.get("timezone")).toBe("Europe/Madrid");
    expect(url.searchParams.get("forecast_days")).toBe("4");
    expect([...url.searchParams.keys()].sort()).toEqual([
      "current",
      "daily",
      "forecast_days",
      "latitude",
      "longitude",
      "timezone",
    ]);
  });
});
