import { IDTOResponseWorldsList } from "shared-types";

import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";

export default class WorldsConfigApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/worlds-config`;

  getList = async (): Promise<IApiResponse<IDTOResponseWorldsList[]>> => {
    return fetchWrapper(`${this.basePath}/list`);
  };
}
