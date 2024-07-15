import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

export interface IExpressRequestWithUserAndSettlement
  extends IExpressRequestWithUser<ISessionUser> {
  settlement: PrivateSettlementDto;
}

@Injectable()
export class SettlementBelongsToUserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private settlementsService: SettlementsService,
  ) {}

  async getSettlement(
    request: IExpressRequestWithUserAndSettlement,
    settlementIdParam: string,
  ) {
    if (!request.body[settlementIdParam] && !request.params[settlementIdParam])
      return false;

    const settlementId =
      request.body[settlementIdParam] || request.params[settlementIdParam];

    const settlement = request.settlement
      ? request.settlement
      : await this.settlementsService.getPrivateSettlementById(settlementId);

    return settlement;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<IExpressRequestWithUserAndSettlement>();
    const settlementIdParam = this.reflector.get<string>(
      'settlementIdParam',
      context.getHandler(),
    );

    const settlement = await this.getSettlement(request, settlementIdParam);
    if (!settlement || settlement.user.id !== request.user.id) {
      return false;
    }

    request.settlement = settlement;
    return true;
  }
}
