import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';

import { NearSettlementLocationGuard } from '~/modules/user-location/guards/near-settlement-location.guard';

export function EnsureWithinLocation(
  settlementIdParam: string,
  mode: 'block' | 'mark' = 'block',
) {
  return applyDecorators(
    SetMetadata('settlementIdParam', settlementIdParam),
    SetMetadata('mode', mode),
    UseGuards(NearSettlementLocationGuard),
  );
}
