import { ArmyEntity } from "../../armies";
import { PublicSettlementDto } from "./public-settlement.dto";

export class PrivateSettlementDto extends PublicSettlementDto {
  gold: number;
  wood: number;
  iron: number;
  army: ArmyEntity;
}
