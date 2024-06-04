import { CronExpression } from '@nestjs/schedule';
import { GameConfig, UnitType } from 'shared-types';

import {
  ResourceTypeEnum,
  SettlementTypesEnum,
} from '~/modules/settlements/entities/settlements.entity';

export const gameConfig = (): GameConfig => ({
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: 30,
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: 30,
  PLAYER_DISCOVER_RADIUS_METERS: 200,
  USER_IS_ONLINE_SECONDS: 60,
  DEFAULT_RESOURCE_DISPOSITION_RATE: CronExpression.EVERY_10_SECONDS,

  COMBAT: {
    UNITS: {
      [UnitType.SWORDSMAN]: { ATTACK: 10, DEFENSE: 5, HEALTH: 50 },
      [UnitType.ARCHER]: { ATTACK: 15, DEFENSE: 3, HEALTH: 30 },
      [UnitType.KNIGHT]: { ATTACK: 20, DEFENSE: 10, HEALTH: 100 },
      [UnitType.LUCHADOR]: { ATTACK: 25, DEFENSE: 8, HEALTH: 80 },
      [UnitType.ARCHMAGE]: { ATTACK: 30, DEFENSE: 5, HEALTH: 60 },
    },
    SIEGE: {
      TIME_TICK_MS: 1_000,
    },
  },

  SETTLEMENT: {
    [SettlementTypesEnum.MINING_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 100,
            [ResourceTypeEnum.wood]: 20,
          },
          TIME_MS: 60_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 4_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 1_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 1,
        [ResourceTypeEnum.gold]: 2,
      },
    },

    [SettlementTypesEnum.CASTLE_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 80,
            [ResourceTypeEnum.wood]: 15,
          },
          TIME_MS: 30_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceTypeEnum.gold]: 200,
            [ResourceTypeEnum.wood]: 60,
          },
          TIME_MS: 60_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 8_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 2_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 2,
        [ResourceTypeEnum.gold]: 4,
      },
    },

    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 50,
            [ResourceTypeEnum.wood]: 7,
          },
          TIME_MS: 15_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceTypeEnum.gold]: 150,
            [ResourceTypeEnum.wood]: 40,
          },
          TIME_MS: 30_000,
        },
        [UnitType.KNIGHT]: {
          COST: {
            [ResourceTypeEnum.gold]: 400,
            [ResourceTypeEnum.wood]: 200,
          },
          TIME_MS: 120_000,
        },
        [UnitType.LUCHADOR]: {
          COST: {
            [ResourceTypeEnum.gold]: 1000,
            [ResourceTypeEnum.wood]: 600,
          },
          TIME_MS: 280_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 16_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 4_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 4,
        [ResourceTypeEnum.gold]: 8,
      },
    },

    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: {
      MAX: 1,
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 10,
            [ResourceTypeEnum.wood]: 1,
          },
          TIME_MS: 5_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceTypeEnum.gold]: 50,
            [ResourceTypeEnum.wood]: 20,
          },
          TIME_MS: 10_000,
        },
        [UnitType.KNIGHT]: {
          COST: {
            [ResourceTypeEnum.gold]: 150,
            [ResourceTypeEnum.wood]: 70,
          },
          TIME_MS: 60_000,
        },
        [UnitType.LUCHADOR]: {
          COST: {
            [ResourceTypeEnum.gold]: 400,
            [ResourceTypeEnum.wood]: 200,
          },
          TIME_MS: 90_000,
        },
        [UnitType.ARCHMAGE]: {
          COST: {
            [ResourceTypeEnum.gold]: 1000,
            [ResourceTypeEnum.wood]: 400,
          },
          TIME_MS: 120_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 100_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 80_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 30,
        [ResourceTypeEnum.gold]: 60,
      },
    },
  },
});
