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

import { EnsureWithinLocation } from '~/common/decorators/ensure-within-location.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { RequestRecruitmentDto } from '~/modules/recruitments/dtos/recruitments.dto';
import { RecruitmentsService } from '~/modules/recruitments/recruitments.service';
import { IExpressRequestWithUserAndSettlement } from '~/modules/user-location/guards/near-settlement-location.guard';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

@ApiTags('recruitments')
@Controller('recruitments')
export class RecruitmentsController {
  constructor(private readonly recruitService: RecruitmentsService) {}

  @Post('/')
  @EnsureWithinLocation('settlementId', 'mark')
  async startRecruitment(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() recruitDto: RequestRecruitmentDto,
  ) {
    return this.recruitService.startRecruitment(recruitDto, req.settlement);
  }

  @Get(':settlementId')
  async getUnfinishedJobs(@Param('settlementId') settlementId: string) {
    return this.recruitService.getUnfinishedRecruitmentsBySettlementId(
      settlementId,
    );
  }

  @Delete(':settlementId/:jobId')
  async cancelRecruitment(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
    @Param('settlementId') settlementId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.recruitService.cancelRecruitment(settlementId, jobId, req.user);
  }
}
