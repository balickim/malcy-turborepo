import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import ConfigApi from "~/api/config";
import { IGameConfigDto } from "~/api/config/dtos";
import store from "~/store";
import { IApiResponse } from "~/types/common";

export function useServerConfig(
  options?: Omit<
    UndefinedInitialDataOptions<IApiResponse<IGameConfigDto>>,
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
