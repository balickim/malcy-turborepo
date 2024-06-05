import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppConfig } from '~/modules/config/appConfig';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private configService: AppConfig) {}

  @Get('/')
  async getConfig() {
    return this.configService.gameConfig;
  }
}
