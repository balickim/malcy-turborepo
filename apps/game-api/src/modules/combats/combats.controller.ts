import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EnsureWithinLocation } from '~/common/decorators/ensure-within-location.decorator';
import { ResponseMessage } from '~/common/decorators/response_message.decorator';
import { CombatsService } from '~/modules/combats/combats.service';
import { StartSiegeDto } from '~/modules/combats/dtos/siege.dto';
import { IExpressRequestWithUserAndSettlement } from '~/modules/user-location/guards/near-settlement-location.guard';

@ApiTags('combats')
@Controller('combats')
export class CombatsController {
  constructor(private readonly combatsService: CombatsService) {}

  @Post('/start-siege')
  @EnsureWithinLocation('settlementId', 'block')
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
