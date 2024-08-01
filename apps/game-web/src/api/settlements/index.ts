import {
  CreateSettlementDto,
  ResponseStartUpgradeDto,
  TransferArmyDto,
  UpgradeSettlementDto,
} from "shared-nestjs";

import { fetchWrapper } from "~/api/fetch";
import {
  IPrivateSettlementDto,
  ISettlementDetailsDto,
} from "~/api/settlements/dtos";
import { IApiResponse, IJob } from "~/types/common";

export default class SettlementsApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/settlements`;

  createSettlement = async (
    body: CreateSettlementDto,
  ): Promise<IApiResponse<IPrivateSettlementDto>> => {
    return fetchWrapper(`${this.basePath}`, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };

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

  upgradeSettlement = async (
    body: UpgradeSettlementDto,
  ): Promise<IApiResponse<ISettlementDetailsDto>> => {
    return fetchWrapper(`${this.basePath}/upgrade`, {
      body: JSON.stringify(body),
      method: "PUT",
    });
  };

  getUnfinishedUpgradeBySettlementId = async (
    id: string,
  ): Promise<IApiResponse<IJob<ResponseStartUpgradeDto>[]>> => {
    return fetchWrapper(`${this.basePath}/upgrade/${id}`);
  };

  cancelRecruitment = async (params: {
    settlementId: string;
    jobId: number;
  }): Promise<IApiResponse<string>> => {
    return fetchWrapper(
      `${this.basePath}/upgrade/${params.settlementId}/${params.jobId}`,
      {
        method: "DELETE",
      },
    );
  };
}
