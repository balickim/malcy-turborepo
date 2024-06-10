import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';
import { WorldsConfigController } from '~/modules/worlds-config/worlds-config.controller';

import { WorldsConfigService } from './worlds-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorldsConfigEntity])],
  providers: [WorldsConfigService],
  controllers: [WorldsConfigController],
  exports: [WorldsConfigService],
})
export class WorldsConfigModule {}
