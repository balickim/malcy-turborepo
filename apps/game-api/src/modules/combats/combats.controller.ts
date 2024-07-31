import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StartSiegeDto } from 'shared-nestjs';

import { EnsureUserIsWithinLocation } from '~/common/decorators/ensure-user-is-within-location.decorator';
import { ResponseMessage } from '~/common/decorators/response-message.decorator';
import { CombatsService } from '~/modules/combats/combats.service';
import { IExpressRequestWithUserAndSettlement } from '~/modules/user-location/guards/near-settlement-location.guard';

@ApiTags('combats')
@Controller('combats')
export class CombatsController {
  constructor(private readonly combatsService: CombatsService) {}

  @Post('/start-siege')
  @EnsureUserIsWithinLocation('settlementId', 'block')
  @ResponseMessage('Army transferred successfully')
  async startSiege(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() siegeDto: StartSiegeDto,
  ) {
    return this.combatsService.startSiege(
      siegeDto,
      req.user.id,
      req.settlement,
    );
  }

  @Get('/siege/:id')
  async getSiege(@Param('id') id: string) {
    return this.combatsService.getSiegeBySettlementId(id);
  }
}
