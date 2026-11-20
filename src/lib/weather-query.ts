import { queryOptions } from "@tanstack/react-query";
import { getZaragozaWeather } from "./weather.functions";

export const weatherQueryOptions = () =>
  queryOptions({
    queryKey: ["zaragoza-weather"],
    queryFn: () => getZaragozaWeather(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
