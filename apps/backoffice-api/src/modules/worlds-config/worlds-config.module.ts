import { Module } from '@nestjs/common';

import { WorldsConfigController } from '~/modules/worlds-config/worlds-config.controller';

import { WorldsConfigService } from './worlds-config.service';

@Module({
  providers: [WorldsConfigService],
  controllers: [WorldsConfigController],
  exports: [WorldsConfigService],
})
export class WorldsConfigModule {}
