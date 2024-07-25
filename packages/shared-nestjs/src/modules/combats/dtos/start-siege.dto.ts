import { UnitType } from "shared-types";
import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";

export const SiegeTypes = {
  DESTRUCTION: "destruction",
  TAKE_OVER: "take-over",
} as const;
export type SiegeType = (typeof SiegeTypes)[keyof typeof SiegeTypes];

export class ArmyUnit {
  @IsInt()
  @Min(1, { message: "Each unit value must be greater than 0." })
  count: number;
}

export class StartSiegeDto {
  @IsString()
  settlementId: string;

  @IsEnum(SiegeTypes, {
    message: "Invalid siege type. Must be one of the predefined siege types.",
  })
  siegeType: SiegeType;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => ArmyUnit)
  army: Record<UnitType, ArmyUnit>;
}
