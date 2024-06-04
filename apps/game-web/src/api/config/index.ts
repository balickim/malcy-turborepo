import { IGameConfigDto } from "~/api/config/dtos";
import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";

export default class ConfigApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/config`;

  getServerConfig = async (): Promise<IApiResponse<IGameConfigDto>> => {
    return fetchWrapper(`${this.basePath}`);
  };
}
