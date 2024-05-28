import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EnsureWithinLocation } from '~/common/decorators/ensure-within-location.decorator';
import { ResponseMessage } from '~/common/decorators/response_message.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { CreateSettlementDto } from '~/modules/settlements/dtos/createSettlementDto';
import TransferArmyDto from '~/modules/settlements/dtos/transferArmyDto';
import { IExpressRequestWithUserAndSettlement } from '~/modules/user-location/guards/near-settlement-location.guard';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('/')
  async createSettlement(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
    @Body()
    createSettlementDto: CreateSettlementDto,
  ) {
    return this.settlementsService.createSettlement(
      createSettlementDto,
      req.user,
    );
  }

  @Get(':id')
  async getSettlementById(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
    @Param() params: { id: string },
  ) {
    return this.settlementsService.getSettlementById(params.id, req.user);
  }

  @Post('/pick-up-army')
  @EnsureWithinLocation('settlementId', 'block')
  @ResponseMessage('Army transferred successfully')
  async pickUpArmy(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() pickUpArmyDto: TransferArmyDto,
  ) {
    return this.settlementsService.pickUpArmy(pickUpArmyDto, req.settlement);
  }

  @Post('/put-down-army')
  @EnsureWithinLocation('settlementId', 'block')
  @ResponseMessage('Army transferred successfully')
  async putDownArmy(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() putDownArmyDto: TransferArmyDto,
  ) {
    return this.settlementsService.putDownArmy(putDownArmyDto, req.settlement);
  }
}
