import { Module } from '@nestjs/common';

import { ConfigController } from '~/modules/config/config.controller';

import { ConfigService } from './config.service';

@Module({
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class ConfigModule {}
