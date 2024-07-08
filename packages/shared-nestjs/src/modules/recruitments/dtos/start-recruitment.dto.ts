import { IsInt, IsString, Min } from "class-validator";
import { UnitType } from "shared-types";

export class StartRecruitmentDto {
  @IsString()
  settlementId: string;

  @IsInt()
  @Min(1)
  unitCount: number;

  unitType: UnitType;
}
