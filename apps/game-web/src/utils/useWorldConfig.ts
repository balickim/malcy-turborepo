import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { WorldConfig } from "shared-types";

import ConfigApi from "~/api/config";
import store from "~/store";
import { IApiResponse } from "~/types/common";

export function useWorldConfig(
  options?: Omit<
    UndefinedInitialDataOptions<IApiResponse<WorldConfig>>,
    "queryKey" | "queryFn"
  >,
) {
  const configApi = new ConfigApi();
  const { serverConfigStore } = store;
  const worldConfig = useQuery({
    ...options,
    queryKey: ["worldConfig"],
    queryFn: () => configApi.getWorldConfig(),
  });

  if (worldConfig.isSuccess) {
    serverConfigStore.setConfig(worldConfig.data.data);
  }

  return worldConfig;
}
