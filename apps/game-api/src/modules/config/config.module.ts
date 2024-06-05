import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ConfigController } from '~/modules/config/config.controller';
import { ConfigService } from '~/modules/config/config.service';

import { AppConfig } from './appConfig';

@Module({
  imports: [HttpModule],
  providers: [AppConfig, ConfigService],
  controllers: [ConfigController],
  exports: [AppConfig, ConfigService],
})
export class ConfigModule {}
