import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StartRecruitmentDto } from 'shared-nestjs';

import { EnsureSettlementBelongsToUserDecorator } from '~/common/decorators/ensure-settlement-belongs-to-user.decorator';
import { EnsureUserIsWithinLocation } from '~/common/decorators/ensure-user-is-within-location.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';
import { RecruitmentsService } from '~/modules/recruitments/recruitments.service';
import { IExpressRequestWithUserAndSettlement } from '~/modules/user-location/guards/near-settlement-location.guard';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

@ApiTags('recruitments')
@Controller('recruitments')
export class RecruitmentsController {
  constructor(private readonly recruitService: RecruitmentsService) {}

  @Post('/')
  @EnsureUserIsWithinLocation('settlementId', 'mark')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  async startRecruitment(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() startRecruitmentDto: StartRecruitmentDto,
  ) {
    return this.recruitService.startRecruitment(
      startRecruitmentDto,
      req.settlement,
    );
  }

  @Get(':settlementId')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  async getUnfinishedJobs(@Param('settlementId') settlementId: string) {
    return this.recruitService.getUnfinishedRecruitmentsBySettlementId(
      settlementId,
    );
  }

  @Delete(':settlementId/:jobId')
  @EnsureSettlementBelongsToUserDecorator('settlementId')
  async cancelRecruitment(
    @Param('settlementId') settlementId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.recruitService.cancelRecruitment(settlementId, jobId);
  }
}
