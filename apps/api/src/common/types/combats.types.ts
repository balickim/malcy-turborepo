import { UnitType } from 'shared-types';

export interface IBattleOutcome {
  result: 'Attacker wins' | 'Defender wins';
  remainingAttackerArmy: Record<UnitType, number>;
  remainingDefenderArmy: Record<UnitType, number>;
}
