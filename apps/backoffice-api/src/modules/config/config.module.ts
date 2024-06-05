import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigController } from '~/modules/config/config.controller';
import { ConfigService } from '~/modules/config/config.service';
import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';

import { AppConfig } from './appConfig';

@Module({
  imports: [TypeOrmModule.forFeature([WorldsConfigEntity])],
  providers: [AppConfig, ConfigService],
  controllers: [ConfigController],
  exports: [AppConfig, ConfigService],
})
export class ConfigModule {}
