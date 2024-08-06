import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { Test, TestingModule } from '@nestjs/testing';
import { UnitType } from 'shared-types';

import { ArmyRepository } from '~/modules/armies/armies.repository';
import { ArmiesService } from '~/modules/armies/armies.service';
import { ConfigService } from '~/modules/config/config.service';
import { SettlementsService } from '~/modules/settlements/settlements.service';

import { CombatsService } from './combats.service';

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
};

describe('CombatsService', () => {
  let combatsService: CombatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombatsService,
        {
          provide: ConfigService,
          useValue: {
            gameConfig: jest.fn().mockResolvedValue({
              COMBAT: {
                UNITS: {
                  SWORDSMAN: { ATTACK: 10, DEFENSE: 10, HEALTH: 10 },
                  ARCHER: { ATTACK: 15, DEFENSE: 5, HEALTH: 8 },
                  KNIGHT: { ATTACK: 20, DEFENSE: 15, HEALTH: 15 },
                  LUCHADOR: { ATTACK: 18, DEFENSE: 12, HEALTH: 12 },
                  ARCHMAGE: { ATTACK: 25, DEFENSE: 5, HEALTH: 10 },
                },
              },
            }),
          },
        },
        {
          provide: SettlementsService,
          useValue: {},
        },
        {
          provide: ArmyRepository,
          useValue: {},
        },
        {
          provide: ArmiesService,
          useValue: {},
        },
        {
          provide: getRedisToken('default'),
          useValue: mockRedis,
        },
      ],
    }).compile();

    combatsService = module.get<CombatsService>(CombatsService);
  });

  describe('calculateBattleOutcome', () => {
    it('should return attacker win when attacker has more power', async () => {
      const attackerArmy = {
        [UnitType.SWORDSMAN]: 10,
        [UnitType.ARCHER]: 5,
        [UnitType.KNIGHT]: 3,
        [UnitType.LUCHADOR]: 2,
        [UnitType.ARCHMAGE]: 1,
      };
      const defenderArmy = {
        [UnitType.SWORDSMAN]: 5,
        [UnitType.ARCHER]: 3,
        [UnitType.KNIGHT]: 1,
        [UnitType.LUCHADOR]: 1,
        [UnitType.ARCHMAGE]: 0,
      };

      const result = await combatsService.calculateBattleOutcome(
        attackerArmy,
        defenderArmy,
      );

      expect(result.result).toBe('Attacker wins');
      expect(result.remainingAttackerArmy).toEqual(
        expect.objectContaining({
          [UnitType.SWORDSMAN]: expect.any(Number),
          [UnitType.ARCHER]: expect.any(Number),
          [UnitType.KNIGHT]: expect.any(Number),
          [UnitType.LUCHADOR]: expect.any(Number),
          [UnitType.ARCHMAGE]: expect.any(Number),
        }),
      );
      expect(result.remainingDefenderArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
    });

    it('should return defender win when defender has more power', async () => {
      const attackerArmy = {
        [UnitType.SWORDSMAN]: 5,
        [UnitType.ARCHER]: 3,
        [UnitType.KNIGHT]: 1,
        [UnitType.LUCHADOR]: 1,
        [UnitType.ARCHMAGE]: 0,
      };
      const defenderArmy = {
        [UnitType.SWORDSMAN]: 10,
        [UnitType.ARCHER]: 5,
        [UnitType.KNIGHT]: 3,
        [UnitType.LUCHADOR]: 2,
        [UnitType.ARCHMAGE]: 1,
      };

      const result = await combatsService.calculateBattleOutcome(
        attackerArmy,
        defenderArmy,
      );

      expect(result.result).toBe('Defender wins');
      expect(result.remainingAttackerArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
      expect(result.remainingDefenderArmy).toEqual(
        expect.objectContaining({
          [UnitType.SWORDSMAN]: expect.any(Number),
          [UnitType.ARCHER]: expect.any(Number),
          [UnitType.KNIGHT]: expect.any(Number),
          [UnitType.LUCHADOR]: expect.any(Number),
          [UnitType.ARCHMAGE]: expect.any(Number),
        }),
      );
    });

    it('should handle equal power and default to defender win', async () => {
      const attackerArmy = {
        [UnitType.SWORDSMAN]: 10,
        [UnitType.ARCHER]: 5,
        [UnitType.KNIGHT]: 3,
        [UnitType.LUCHADOR]: 2,
        [UnitType.ARCHMAGE]: 1,
      };
      const defenderArmy = {
        [UnitType.SWORDSMAN]: 10,
        [UnitType.ARCHER]: 5,
        [UnitType.KNIGHT]: 3,
        [UnitType.LUCHADOR]: 2,
        [UnitType.ARCHMAGE]: 1,
      };

      const result = await combatsService.calculateBattleOutcome(
        attackerArmy,
        defenderArmy,
      );

      expect(result.result).toBe('Defender wins');
      expect(result.remainingAttackerArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
      expect(result.remainingDefenderArmy).toEqual(
        expect.objectContaining({
          [UnitType.SWORDSMAN]: expect.any(Number),
          [UnitType.ARCHER]: expect.any(Number),
          [UnitType.KNIGHT]: expect.any(Number),
          [UnitType.LUCHADOR]: expect.any(Number),
          [UnitType.ARCHMAGE]: expect.any(Number),
        }),
      );
    });

    it('should return zero remaining units for both armies when no units', async () => {
      const attackerArmy = {
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      };
      const defenderArmy = {
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      };

      const result = await combatsService.calculateBattleOutcome(
        attackerArmy,
        defenderArmy,
      );

      expect(result.result).toBe('Defender wins');
      expect(result.remainingAttackerArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
      expect(result.remainingDefenderArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
    });

    it('should handle negative unit counts gracefully', async () => {
      const attackerArmy = {
        [UnitType.SWORDSMAN]: -5,
        [UnitType.ARCHER]: -3,
        [UnitType.KNIGHT]: -1,
        [UnitType.LUCHADOR]: -1,
        [UnitType.ARCHMAGE]: 0,
      };
      const defenderArmy = {
        [UnitType.SWORDSMAN]: -10,
        [UnitType.ARCHER]: -5,
        [UnitType.KNIGHT]: -3,
        [UnitType.LUCHADOR]: -2,
        [UnitType.ARCHMAGE]: -1,
      };

      const result = await combatsService.calculateBattleOutcome(
        attackerArmy,
        defenderArmy,
      );

      expect(result.result).toBe('Defender wins');
      expect(result.remainingAttackerArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
      expect(result.remainingDefenderArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
    });

    it('should handle very large army sizes', async () => {
      const attackerArmy = {
        [UnitType.SWORDSMAN]: 1_000_000,
        [UnitType.ARCHER]: 1_000_000,
        [UnitType.KNIGHT]: 1_000_000,
        [UnitType.LUCHADOR]: 1_000_000,
        [UnitType.ARCHMAGE]: 1_000_000,
      };
      const defenderArmy = {
        [UnitType.SWORDSMAN]: 500_000,
        [UnitType.ARCHER]: 500_000,
        [UnitType.KNIGHT]: 500_000,
        [UnitType.LUCHADOR]: 500_000,
        [UnitType.ARCHMAGE]: 500_000,
      };

      const result = await combatsService.calculateBattleOutcome(
        attackerArmy,
        defenderArmy,
      );

      expect(result.result).toBe('Attacker wins');
      expect(result.remainingAttackerArmy).toEqual(
        expect.objectContaining({
          [UnitType.SWORDSMAN]: expect.any(Number),
          [UnitType.ARCHER]: expect.any(Number),
          [UnitType.KNIGHT]: expect.any(Number),
          [UnitType.LUCHADOR]: expect.any(Number),
          [UnitType.ARCHMAGE]: expect.any(Number),
        }),
      );
      expect(result.remainingDefenderArmy).toEqual({
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      });
    });
  });
});
