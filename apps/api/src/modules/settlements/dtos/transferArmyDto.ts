import { UnitType } from 'shared-types';

export default class TransferArmyDto {
  settlementId: string;
  [UnitType.SWORDSMAN]: number;
  [UnitType.ARCHER]: number;
  [UnitType.KNIGHT]: number;
  [UnitType.LUCHADOR]: number;
  [UnitType.ARCHMAGE]: number;
}
