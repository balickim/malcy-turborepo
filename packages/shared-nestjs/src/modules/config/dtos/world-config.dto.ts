import { Type } from "class-transformer";
import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsIn,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { SharedSettlementTypesEnum, UnitType } from "shared-types";

export enum ResourceTypeEnum {
  wood = "wood",
  gold = "gold",
  iron = "iron",
}

@ValidatorConstraint({ name: "isCoordinatePair", async: false })
class IsCoordinatePairConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!Array.isArray(value) || value.length !== 2) {
      return false;
    }
    return value.every((item) => typeof item === "number");
  }

  defaultMessage(args: ValidationArguments) {
    return "Each element in WORLD_BOUNDS must be a coordinate pair (array of two numbers)";
  }
}

class ResourceDto {
  @IsNumber()
  [ResourceTypeEnum.gold]: number;

  @IsNumber()
  [ResourceTypeEnum.wood]: number;

  @IsNumber()
  [ResourceTypeEnum.iron]: number;
}

class BuyDto {
  @ValidateNested()
  @Type(() => ResourceDto)
  COST: ResourceDto;

  @IsNumber()
  TIME_MS: number;
}

class UnitCombatStatsDto {
  @IsNumber()
  ATTACK: number;

  @IsNumber()
  DEFENSE: number;

  @IsNumber()
  HEALTH: number;
}

class UnitTypeMapperDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UnitCombatStatsDto)
  [UnitType.SWORDSMAN]?: UnitCombatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UnitCombatStatsDto)
  [UnitType.ARCHER]?: UnitCombatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UnitCombatStatsDto)
  [UnitType.KNIGHT]?: UnitCombatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UnitCombatStatsDto)
  [UnitType.LUCHADOR]?: UnitCombatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UnitCombatStatsDto)
  [UnitType.ARCHMAGE]?: UnitCombatStatsDto;
}

class RecruitmentMapperDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BuyDto)
  [UnitType.SWORDSMAN]?: BuyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BuyDto)
  [UnitType.ARCHER]?: BuyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BuyDto)
  [UnitType.KNIGHT]?: BuyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BuyDto)
  [UnitType.LUCHADOR]?: BuyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BuyDto)
  [UnitType.ARCHMAGE]?: BuyDto;
}

class SettlementConfigDto {
  @IsIn(["infinite", 1, 2, 3, 4, 5])
  MAX: "infinite" | number;

  @ValidateNested()
  @Type(() => RecruitmentMapperDto)
  RECRUITMENT: RecruitmentMapperDto;

  @ValidateNested()
  @Type(() => ResourceDto)
  RESOURCES_CAP: ResourceDto;

  @ValidateNested()
  @Type(() => ResourceDto)
  RESOURCE_GENERATION_BASE: ResourceDto;
}

class SiegeConfigDto {
  @IsNumber()
  TIME_TICK_MS: number;
}

class CombatConfigDto {
  @ValidateNested()
  @Type(() => UnitTypeMapperDto)
  UNITS: UnitTypeMapperDto;

  @ValidateNested()
  @Type(() => SiegeConfigDto)
  SIEGE: SiegeConfigDto;
}

class SettlementTypesConfigDto {
  @ValidateNested()
  @Type(() => SettlementConfigDto)
  [SharedSettlementTypesEnum.MINING_TOWN]: SettlementConfigDto;

  @ValidateNested()
  @Type(() => SettlementConfigDto)
  [SharedSettlementTypesEnum.CASTLE_TOWN]: SettlementConfigDto;

  @ValidateNested()
  @Type(() => SettlementConfigDto)
  [SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]: SettlementConfigDto;

  @ValidateNested()
  @Type(() => SettlementConfigDto)
  [SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]: SettlementConfigDto;
}

export class WorldConfigDto {
  @IsArray()
  @Validate(IsCoordinatePairConstraint, { each: true })
  WORLD_BOUNDS: [number, number][];

  @IsNumber()
  MAX_RADIUS_TO_TAKE_ACTION_METERS: number;

  @IsNumber()
  MAX_RADIUS_TO_DISCOVER_METERS: number;

  @IsNumber()
  MAX_USER_SPEED_METERS_PER_SECOND: number;

  @IsNumber()
  MAX_USER_IS_ONLINE_SECONDS: number;

  @ValidateNested()
  @Type(() => CombatConfigDto)
  COMBAT: CombatConfigDto;

  @ValidateNested()
  @Type(() => SettlementTypesConfigDto)
  SETTLEMENT: SettlementTypesConfigDto;

  @IsString()
  DEFAULT_RESOURCE_DISPOSITION_RATE: string;
}
