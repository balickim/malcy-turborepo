import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { WorldConfig } from "shared-types";

import ConfigApi from "~/api/config";
import store from "~/store";
import { IApiResponse } from "~/types/common";

export function useServerConfig(
  options?: Omit<
    UndefinedInitialDataOptions<IApiResponse<WorldConfig>>,
    "queryKey" | "queryFn"
  >,
) {
  const configApi = new ConfigApi();
  const { serverConfigStore } = store;
  const serverConfig = useQuery({
    ...options,
    queryKey: ["serverConfig"],
    queryFn: () => configApi.getServerConfig(),
  });

  if (serverConfig.isSuccess) {
    serverConfigStore.setConfig(serverConfig.data.data);
  }

  return serverConfig;
}
