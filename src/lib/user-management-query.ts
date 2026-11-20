import { queryOptions } from "@tanstack/react-query";
import { getAccountDetails, listCityUsers } from "./user-management.functions";

export const accountDetailsOptions = (userId: string) =>
  queryOptions({
    queryKey: ["account-details", userId],
    queryFn: () => getAccountDetails(),
    staleTime: 30_000,
    retry: false,
  });

export const cityUsersOptions = (userId: string, page: number) =>
  queryOptions({
    queryKey: ["city-users", userId, page],
    queryFn: () => listCityUsers({ data: { page } }),
    staleTime: 15_000,
    retry: false,
  });
