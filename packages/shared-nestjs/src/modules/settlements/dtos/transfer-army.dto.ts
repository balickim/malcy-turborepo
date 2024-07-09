import { UnitType } from "shared-types";
import { Min, IsString } from "class-validator";

export class TransferArmyDto {
  @IsString()
  settlementId: string;

  @Min(0)
  [UnitType.SWORDSMAN]: number;

  @Min(0)
  [UnitType.ARCHER]: number;

  @Min(0)
  [UnitType.KNIGHT]: number;

  @Min(0)
  [UnitType.LUCHADOR]: number;

  @Min(0)
  [UnitType.ARCHMAGE]: number;
}
