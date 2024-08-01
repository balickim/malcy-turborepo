import { IResource, UnitType } from "shared-types";

export class ResponseStartRecruitmentDto {
  settlementId: string;
  userId: string;
  unitCount: number;
  unitType: UnitType;
  unitRecruitmentTime: number;
  finishesOn: Date;
  lockedResources: IResource;
}
