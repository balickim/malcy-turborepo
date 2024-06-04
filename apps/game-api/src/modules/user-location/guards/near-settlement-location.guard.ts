import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { convertGeoJSONToPoint } from '~/common/utils/postgis';
import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

export interface IExpressRequestWithUserAndSettlement
  extends IExpressRequestWithUser<IJwtUser> {
  settlement: PrivateSettlementDto;
}

@Injectable()
export class NearSettlementLocationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private settlementsService: SettlementsService,
    private userLocationService: UserLocationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<IExpressRequestWithUserAndSettlement>();
    const settlementIdParam = this.reflector.get<string>(
      'settlementIdParam',
      context.getHandler(),
    );
    const mode =
      this.reflector.get<string>('mode', context.getHandler()) || 'block';
    const settlementId = request.body[settlementIdParam];
    const settlement =
      await this.settlementsService.getPrivateSettlementById(settlementId);
    request.settlement = settlement;

    const isUserWithinRadius =
      await this.userLocationService.isUserWithinRadius({
        userId: request.user.id,
        location: convertGeoJSONToPoint(settlement.location),
      });

    if (!isUserWithinRadius) {
      if (mode === 'block') {
        throw new BadRequestException('You are too far');
      }
    }

    request.user._IsNear = true;
    return true;
  }
}
