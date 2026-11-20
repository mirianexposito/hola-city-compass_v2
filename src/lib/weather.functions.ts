import { createServerFn } from "@tanstack/react-start";
import { parseWeather } from "./weather";

// Public, fixed-city data only. No profile answers or location permission are sent upstream.
export const getZaragozaWeather = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: "41.6488",
      longitude: "-0.8891",
      current: "temperature_2m,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "Europe/Madrid",
      forecast_days: "4",
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Weather provider unavailable");
    return { forecast: parseWeather(await response.json()), error: null };
  } catch {
    return {
      forecast: null,
      error: "No se pudo consultar el tiempo de Zaragoza. Tus planes siguen disponibles.",
    };
  }
});
