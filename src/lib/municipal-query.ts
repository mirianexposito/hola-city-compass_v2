import { queryOptions } from "@tanstack/react-query";
import { getZaragozaDirectories } from "./municipal.functions";

export const municipalQueryOptions = () =>
  queryOptions({
    queryKey: ["zaragoza-municipal-directories"],
    queryFn: () => getZaragozaDirectories(),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
