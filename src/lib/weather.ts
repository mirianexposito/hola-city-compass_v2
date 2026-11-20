import { z } from "zod";

const dates = z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).length(4);
const numbers = z.array(z.number().finite()).length(4);
const weatherSchema = z.object({
  timezone: z.literal("Europe/Madrid"),
  current: z.object({
    time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    temperature_2m: z.number().finite(),
    weather_code: z.number().int(),
    wind_speed_10m: z.number().nonnegative(),
  }),
  daily: z.object({
    time: dates,
    weather_code: numbers,
    temperature_2m_max: numbers,
    temperature_2m_min: numbers,
    precipitation_probability_max: z.array(z.number().min(0).max(100)).length(4),
  }),
});

export type WeatherKind = "sun" | "cloud" | "fog" | "rain" | "snow" | "storm";
export function weatherCondition(code: number): { label: string; kind: WeatherKind } {
  if (code === 0) return { label: "Despejado", kind: "sun" };
  if (code === 1) return { label: "Mayormente despejado", kind: "sun" };
  if (code === 2) return { label: "Parcialmente nublado", kind: "cloud" };
  if (code === 3) return { label: "Nublado", kind: "cloud" };
  if (code === 45 || code === 48) return { label: "Niebla", kind: "fog" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Nieve", kind: "snow" };
  if ([95, 96, 99].includes(code)) return { label: "Tormenta", kind: "storm" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Lluvia", kind: "rain" };
  return { label: "Tiempo variable", kind: "cloud" };
}

export function parseWeather(input: unknown) {
  const data = weatherSchema.parse(input);
  return {
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      code: data.current.weather_code,
      wind: data.current.wind_speed_10m,
    },
    days: data.daily.time.map((date, index) => ({
      date,
      code: data.daily.weather_code[index] ?? 0,
      max: data.daily.temperature_2m_max[index] ?? 0,
      min: data.daily.temperature_2m_min[index] ?? 0,
      rain: data.daily.precipitation_probability_max[index] ?? 0,
    })),
  };
}

export function weatherAdvice(current: ReturnType<typeof parseWeather>["current"]) {
  const { kind } = weatherCondition(current.code);
  if (kind === "storm" || kind === "snow")
    return "Mejor un plan a cubierto; consulta los avisos oficiales antes de salir.";
  if (kind === "rain") return "Lleva paraguas; hoy puede apetecer un museo o un café.";
  if (current.wind >= 35) return "Hay viento: busca un rincón resguardado para tu paseo.";
  if (current.temperature >= 32) return "Busca sombra y evita las horas de más calor.";
  if (current.temperature <= 7) return "Abrígate si sales; un café puede ser una buena pausa.";
  if (kind === "fog") return "Si sales a pasear, ten en cuenta la visibilidad.";
  return "Puede ser un buen momento para descubrir tu barrio a pie.";
}

export function forecastDayLabel(date: string, index: number) {
  if (index === 0) return "Hoy";
  if (index === 1) return "Mañana";
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${date}T12:00:00Z`));
}
