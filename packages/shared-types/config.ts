import { UnitType } from './armies';
import { SettlementTypesEnum } from './settlements';

export const enum ResourceTypeEnum {
  wood = 'wood',
  gold = 'gold',
}

export interface IResource {
  [ResourceTypeEnum.gold]: number;
  [ResourceTypeEnum.wood]: number;
}

interface UnitRecruitment {
  COST: IResource;
  TIME_MS: number;
}

interface UnitCombatStats {
  ATTACK: number;
  DEFENSE: number;
  HEALTH: number;
}

interface UnitTypeMapper<T> {
  [UnitType.SWORDSMAN]?: T;
  [UnitType.ARCHER]?: T;
  [UnitType.KNIGHT]?: T;
  [UnitType.LUCHADOR]?: T;
  [UnitType.ARCHMAGE]?: T;
}

interface SettlementConfig {
  MAX: number | 'infinite';
  RECRUITMENT: UnitTypeMapper<UnitRecruitment>;
  RESOURCES_CAP: IResource;
  RESOURCE_GENERATION_BASE: IResource;
}

export interface WorldConfig {
  // World boundaries configuration
  WORLD_BOUNDS: [number, number][];

  // Action and interaction configurations
  MAX_RADIUS_TO_TAKE_ACTION_METERS: number;
  MAX_RADIUS_TO_DISCOVER_METERS: number;
  MAX_USER_SPEED_METERS_PER_SECOND: number;
  MAX_USER_IS_ONLINE_SECONDS: number;

  // Combat configurations
  COMBAT: {
    UNITS: UnitTypeMapper<UnitCombatStats>;
    SIEGE: {
      TIME_TICK_MS: number;
    };
  };

  // Settlement configurations
  SETTLEMENT: {
    [SettlementTypesEnum.MINING_TOWN]: SettlementConfig;
    [SettlementTypesEnum.CASTLE_TOWN]: SettlementConfig;
    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: SettlementConfig;
    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: SettlementConfig;
  };
}