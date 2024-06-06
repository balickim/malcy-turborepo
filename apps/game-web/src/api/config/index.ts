import { WorldConfig } from "shared-types";

import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";

export default class ConfigApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/config`;

  getWorldConfig = async (): Promise<IApiResponse<WorldConfig>> => {
    return fetchWrapper(`${this.basePath}`);
  };
}
