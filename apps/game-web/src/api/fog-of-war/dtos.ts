import { SettlementTypesEnum } from "~/api/settlements/dtos";
import { UnitType } from "~/types/army";

export interface IDiscoveredSettlement {
  discoveredByUserId: string;
  userId: string;
  settlementId: string;
  type: SettlementTypesEnum;
  [UnitType.SWORDSMAN]: number;
  [UnitType.ARCHER]: number;
  [UnitType.KNIGHT]: number;
  [UnitType.LUCHADOR]: number;
  [UnitType.ARCHMAGE]: number;
}
