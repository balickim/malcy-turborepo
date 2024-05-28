import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConfigService } from '~/modules/config/config.service';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get('/')
  async getConfig() {
    return this.configService.gameConfig;
  }
}
