import { useQuery } from "@tanstack/react-query";
import { IDTOResponseWorldsList } from "shared-types";

import WorldsConfigApi from "~/api/worldsConfig";
import { IApiResponse } from "~/types/common";

export function useWorldList(
  options?: Omit<
    IApiResponse<IDTOResponseWorldsList[]>,
    "queryKey" | "queryFn"
  >,
) {
  const worldsConfigApi = new WorldsConfigApi();
  return useQuery({
    ...options,
    queryKey: ["worldList"],
    queryFn: () => worldsConfigApi.getList(),
  });
}
