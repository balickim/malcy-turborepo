import { StartSiegeDto } from "../dtos";
import { PrivateSettlementDto } from "../../settlements";

export interface ISiegeJob extends StartSiegeDto {
  defenderSettlement: PrivateSettlementDto;
  attackerUserId: string;
}
