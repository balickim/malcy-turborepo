import { TransferArmyDto } from "shared-nestjs";

import { fetchWrapper } from "~/api/fetch";
import {
  IPrivateSettlementDto,
  ISettlementDetailsDto,
} from "~/api/settlements/dtos";
import { IApiResponse } from "~/types/common";

export default class SettlementsApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/settlements`;

  getSettlementById = async (
    id: string,
  ): Promise<IApiResponse<IPrivateSettlementDto>> => {
    return fetchWrapper(`${this.basePath}/${id}`);
  };

  pickUpArmy = async (
    body: TransferArmyDto,
  ): Promise<IApiResponse<ISettlementDetailsDto>> => {
    return fetchWrapper(`${this.basePath}/pick-up-army`, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };

  putDownArmy = async (
    body: TransferArmyDto,
  ): Promise<IApiResponse<ISettlementDetailsDto>> => {
    return fetchWrapper(`${this.basePath}/put-down-army`, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };
}
