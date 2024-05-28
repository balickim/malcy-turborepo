import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from '~/common/decorators/response_message.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { FogOfWarService } from '~/modules/fog-of-war/fog-of-war.service';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

@ApiTags('fog-of-war')
@Controller('fog-of-war')
export class FogOfWarController {
  constructor(private readonly fogOfWarService: FogOfWarService) {}

  @Get('/discovered-areas')
  async getUsersDiscoveredAreas(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
  ) {
    return this.fogOfWarService.findAllDiscoveredByUser(req.user.id);
  }

  @Get('/visible-areas')
  async getUsersVisibleAreas(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
  ) {
    return this.fogOfWarService.findAllVisibleByUser(req.user.id);
  }

  @Get('/bounds')
  @ResponseMessage('Fetched Settlements Succesfully')
  async findInBounds(
    @Query('southWestLat') southWestLat: string,
    @Query('southWestLng') southWestLng: string,
    @Query('northEastLat') northEastLat: string,
    @Query('northEastLng') northEastLng: string,
    @Request() req: IExpressRequestWithUser<IJwtUser>,
  ) {
    const southWest = {
      lat: parseFloat(southWestLat),
      lng: parseFloat(southWestLng),
    };
    const northEast = {
      lat: parseFloat(northEastLat),
      lng: parseFloat(northEastLng),
    };

    return this.fogOfWarService.findSettlementsInBounds(
      req.user.id,
      southWest,
      northEast,
    );
  }

  @Get(':id')
  async getDiscoveredSettlementById(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
    @Param() params: { id: string },
  ) {
    return this.fogOfWarService.getDiscoveredSettlementById(
      params.id,
      req.user,
    );
  }
}
