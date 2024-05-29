import { fetchWrapper } from "~/api/fetch";
import {
  IRequestRecruitmentDto,
  IResponseRecruitmentDto,
} from "~/api/recruitments/dtos";
import { IApiResponse, IJob } from "~/types/common";

export default class RecruitmentsApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/recruitments`;

  startRecruitment = async (
    body: IRequestRecruitmentDto,
  ): Promise<IJob<IResponseRecruitmentDto>> => {
    return fetchWrapper(this.basePath, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };

  getUnfinishedRecruitmentsBySettlementId = async (
    id: string,
  ): Promise<IApiResponse<IJob<IResponseRecruitmentDto>[]>> => {
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
