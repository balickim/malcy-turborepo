import { StartSiegeDto } from '~/modules/combats/dtos/siege.dto';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';

export interface ISiegeJob extends StartSiegeDto {
  defenderSettlement: PrivateSettlementDto;
  attackerUserId: string;
}
