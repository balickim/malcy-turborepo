import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSettlementDto, TransferArmyDto } from 'shared-nestjs';

import { EnsureSettlementBelongsToUserDecorator } from '~/common/decorators/ensure-settlement-belongs-to-user.decorator';
import { EnsureUserIsWithinLocation } from '~/common/decorators/ensure-user-is-within-location.decorator';
import { ResponseMessage } from '~/common/decorators/response-message.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';
import { IExpressRequestWithUserAndSettlement } from '~/modules/user-location/guards/near-settlement-location.guard';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('/')
  async createSettlement(
    @Request() req: IExpressRequestWithUser<ISessionUser>,
    @Body() createSettlementDto: CreateSettlementDto,
  ) {
    return this.settlementsService.createSettlement(
      createSettlementDto,
      req.user,
    );
  }

  @Get(':id')
  async getSettlementById(
    @Request() req: IExpressRequestWithUser<ISessionUser>,
    @Param() params: { id: string },
  ) {
    return this.settlementsService.getSettlementById(params.id, req.user);
  }

  @Post('/pick-up-army')
  @EnsureUserIsWithinLocation('settlementId', 'block')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  @ResponseMessage('Army transferred successfully')
  async pickUpArmy(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() transferArmyDto: TransferArmyDto,
  ) {
    return this.settlementsService.transferArmy(
      transferArmyDto,
      req.settlement,
      true,
    );
  }

  @Post('/put-down-army')
  @EnsureUserIsWithinLocation('settlementId', 'block')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  @ResponseMessage('Army transferred successfully')
  async putDownArmy(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() transferArmyDto: TransferArmyDto,
  ) {
    return this.settlementsService.transferArmy(
      transferArmyDto,
      req.settlement,
      false,
    );
  }

  @Put('/upgrade')
  @EnsureUserIsWithinLocation('settlementId', 'block')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  async upgradeSettlement(
    @Request() req: IExpressRequestWithUserAndSettlement,
  ) {
    return this.settlementsService.upgradeSettlementType(req.settlement);
  }

  @Get('/upgrade/:settlementId')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  async getUnfinishedJobs(@Param('settlementId') settlementId: string) {
    return this.settlementsService.getUnfinishedUpgradeBySettlementId(
      settlementId,
    );
  }

  @Delete('/upgrade/:settlementId/:jobId')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  async cancelRecruitment(
    @Param('settlementId') settlementId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.settlementsService.cancelUpgrade(settlementId, jobId);
  }
}
