import { StartSiegeDto } from 'shared-nestjs';

import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';

export interface ISiegeJob extends StartSiegeDto {
  defenderSettlement: PrivateSettlementDto;
  attackerUserId: string;
}
