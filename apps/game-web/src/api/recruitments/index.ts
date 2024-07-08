import {
  ResponseStartRecruitmentDto,
  StartRecruitmentDto,
} from "shared-nestjs";

import { fetchWrapper } from "~/api/fetch";
import { IApiResponse, IJob } from "~/types/common";

export default class RecruitmentsApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/recruitments`;

  startRecruitment = async (
    body: StartRecruitmentDto,
  ): Promise<IJob<ResponseStartRecruitmentDto>> => {
    return fetchWrapper(this.basePath, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };

  getUnfinishedRecruitmentsBySettlementId = async (
    id: string,
  ): Promise<IApiResponse<IJob<ResponseStartRecruitmentDto>[]>> => {
    return fetchWrapper(`${this.basePath}/${id}`);
  };

  cancelRecruitment = async (params: {
    settlementId: string;
    jobId: number;
  }): Promise<IApiResponse<string>> => {
    return fetchWrapper(
      `${this.basePath}/${params.settlementId}/${params.jobId}`,
      {
        method: "DELETE",
      },
    );
  };
}
