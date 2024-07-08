import { ResponseStartRecruitmentDto } from "shared-nestjs";

import { fetchWrapper } from "~/api/fetch";
import { TArmy } from "~/types/army";
import { IJob } from "~/types/common";

export default class CombatsApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/combats`;

  startSiege = async (body: {
    army: TArmy;
    settlementId: string;
  }): Promise<IJob<ResponseStartRecruitmentDto>> => {
    return fetchWrapper(`${this.basePath}/start-siege`, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };

  getSiege = async (
    id: string,
  ): Promise<
    IJob<
      | false
      | {
          jobId: string;
          data: never;
          remainingDelay: number;
          progress: number | object;
        }
    >
  > => {
    return fetchWrapper(`${this.basePath}/siege/${id}`);
  };
}
