import { UnitTypeName } from "~/types/army";

export interface IRequestRecruitmentDto {
  settlementId: string;
  unitCount: number;
  unitType: UnitTypeName;
}

export interface IResponseRecruitmentDto {
  settlementId: string;
  unitCount: number;
  unitType: UnitTypeName;
  finishesOn: Date;
}
