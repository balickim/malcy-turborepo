import { UnitType } from './armies';

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

interface Recruitment {
  [UnitType.SWORDSMAN]?: UnitRecruitment;
  [UnitType.ARCHER]?: UnitRecruitment;
  [UnitType.KNIGHT]?: UnitRecruitment;
  [UnitType.LUCHADOR]?: UnitRecruitment;
  [UnitType.ARCHMAGE]?: UnitRecruitment;
}

interface UnitCombat {
  [UnitType.SWORDSMAN]?: UnitCombatStats;
  [UnitType.ARCHER]?: UnitCombatStats;
  [UnitType.KNIGHT]?: UnitCombatStats;
  [UnitType.LUCHADOR]?: UnitCombatStats;
  [UnitType.ARCHMAGE]?: UnitCombatStats;
}

interface SettlementConfig {
  MAX: number | 'infinite';
  RECRUITMENT: Recruitment;
  RESOURCES_CAP: IResource;
  RESOURCE_GENERATION_BASE: IResource;
}

export interface GameConfig {
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: number;
  PLAYER_DISCOVER_RADIUS_METERS: number;
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: number;
  USER_IS_ONLINE_SECONDS: number;
  DEFAULT_RESOURCE_DISPOSITION_RATE: CronExpression;
  COMBAT: { UNITS: UnitCombat; SIEGE: { TIME_TICK_MS: number } };
  SETTLEMENT: {
    [SettlementTypesEnum.MINING_TOWN]: SettlementConfig;
    [SettlementTypesEnum.CASTLE_TOWN]: SettlementConfig;
    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: SettlementConfig;
    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: SettlementConfig;
  };
}