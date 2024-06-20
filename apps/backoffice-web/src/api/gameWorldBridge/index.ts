import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";

export default class GameWorldBridgeApi {
  private readonly basePath = `${import.meta.env.VITE_BACKOFFICE_API_URL}/game-world-bridge`;

  getSettlementList = async (): Promise<IApiResponse<unknown[]>> => {
    return fetchWrapper(`${this.basePath}/settlements`);
  };
}
