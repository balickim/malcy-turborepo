import { SettlementTypesEnum } from "~/api/settlements/dtos";
import { UnitType } from "~/types/army";

export enum ResourceTypeEnum {
  gold = "gold",
  wood = "wood",
}

export interface IResources {
  [ResourceTypeEnum.gold]: number;
  [ResourceTypeEnum.wood]: number;
}

interface IUnitRecruitment {
  COST: IResources;
  TIME_MS: number;
}

interface IRecruitment {
  [UnitType.SWORDSMAN]?: IUnitRecruitment;
  [UnitType.ARCHER]?: IUnitRecruitment;
  [UnitType.KNIGHT]?: IUnitRecruitment;
  [UnitType.LUCHADOR]?: IUnitRecruitment;
  [UnitType.ARCHMAGE]?: IUnitRecruitment;
}

interface ISettlementConfig {
  MAX: number | "infinite";
  RECRUITMENT: IRecruitment;
  RESOURCES_CAP: IResources;
  RESOURCE_GENERATION_BASE: IResources;
}

export interface IGameConfigDto {
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: number;
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: number;
  SETTLEMENT: {
    [SettlementTypesEnum.MINING_TOWN]: ISettlementConfig;
    [SettlementTypesEnum.CASTLE_TOWN]: ISettlementConfig;
    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: ISettlementConfig;
    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: ISettlementConfig;
  };
}
