import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConfigService } from '~/modules/config/config.service';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get(':worldName')
  async getWorldsConfig(@Param('worldName') worldName: string) {
    return this.configService.getWorldsConfig(worldName);
  }
}
