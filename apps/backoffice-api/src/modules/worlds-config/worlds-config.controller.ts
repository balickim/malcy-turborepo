import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { WorldsConfigService } from '~/modules/worlds-config/worlds-config.service';

@ApiTags('worlds-config')
@Controller('worlds-config')
export class WorldsConfigController {
  constructor(private worldsConfigService: WorldsConfigService) {}

  @Get('list')
  async getList() {
    return this.worldsConfigService.getWorldsList();
  }
}
