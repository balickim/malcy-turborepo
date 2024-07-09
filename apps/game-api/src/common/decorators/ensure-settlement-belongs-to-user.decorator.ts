import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';

import { SettlementBelongsToUserGuard } from '~/modules/settlements/guards/settlement-belongs-to-user.guard';

export function EnsureSettlementBelongsToUserDecorator(
  settlementIdParam: string,
) {
  return applyDecorators(
    SetMetadata('settlementIdParam', settlementIdParam),
    UseGuards(SettlementBelongsToUserGuard),
  );
}
