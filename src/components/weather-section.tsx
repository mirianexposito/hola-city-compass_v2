import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Droplets,
  RefreshCw,
  Snowflake,
  Sun,
  Wind,
} from "lucide-react";
import { Button } from "./ui/button";
import { forecastDayLabel, weatherAdvice, weatherCondition, type WeatherKind } from "@/lib/weather";
import { weatherQueryOptions } from "@/lib/weather-query";

const weatherIcons: Record<WeatherKind, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: Snowflake,
  storm: CloudLightning,
};

export function WeatherSection() {
  const { data, refetch, isFetching, isRefetchError } = useSuspenseQuery(weatherQueryOptions());
  const forecast = data.forecast;
  const condition = forecast ? weatherCondition(forecast.current.code) : null;
  const Icon = condition ? weatherIcons[condition.kind] : Cloud;
  return (
    <section className="border-b border-border py-6" aria-labelledby="weather-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="weather-title" className="text-lg font-bold">
          El tiempo en Zaragoza
        </h2>
        <Button
          variant="ghost"
          size="icon"
          disabled={isFetching}
          aria-label="Actualizar el tiempo"
          title="Actualizar el tiempo"
          onClick={() => void refetch()}
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin motion-reduce:animate-none" : ""}
          />
        </Button>
      </div>
      {forecast && condition ? (
        <>
          <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                <Icon className="shrink-0 text-primary" size={38} aria-hidden="true" />
                <p className="text-3xl font-bold tabular-nums">
                  {Math.round(forecast.current.temperature)} °C
                </p>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{condition.label}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Wind size={13} aria-hidden="true" />
                    {Math.round(forecast.current.wind)} km/h
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {weatherAdvice(forecast.current)}
              </p>
            </div>
            <div
              className="grid grid-cols-4 divide-x divide-border"
              aria-label="Previsión de cuatro días"
            >
              {forecast.days.map((day, index) => {
                const dayCondition = weatherCondition(day.code);
                const DayIcon = weatherIcons[dayCondition.kind];
                return (
                  <div
                    key={day.date}
                    className="flex min-w-0 flex-col items-center gap-2 px-1 text-center"
                  >
                    <span className="text-[11px] font-semibold capitalize">
                      {forecastDayLabel(day.date, index)}
                    </span>
                    <DayIcon
                      className="text-secondary-foreground"
                      size={23}
                      aria-label={dayCondition.label}
                    />
                    <span className="text-xs tabular-nums">
                      <strong>{Math.round(day.max)}°</strong>{" "}
                      <span className="text-muted-foreground">{Math.round(day.min)}°</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Droplets size={11} aria-hidden="true" />
                      {day.rain}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Previsión de{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open-Meteo
            </a>
            {" · "}
            {forecast.current.time.slice(8, 10)}/{forecast.current.time.slice(5, 7)}
            {" a las "}
            {forecast.current.time.slice(11, 16)} (hora de Zaragoza) · % de probabilidad de lluvia
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {data.error}
        </p>
      )}
      {isRefetchError && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          No se pudo actualizar el tiempo. Vuelve a intentarlo.
        </p>
      )}
    </section>
  );
}
