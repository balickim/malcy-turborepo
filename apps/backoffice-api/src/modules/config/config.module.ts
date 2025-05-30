import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorldsConfigEntity } from 'shared-nestjs';

import { AuthModule } from '~/modules/auth/auth.module';
import { ConfigController } from '~/modules/config/config.controller';
import { ConfigService } from '~/modules/config/config.service';

import { AppConfig } from './appConfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorldsConfigEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [AppConfig, ConfigService],
  controllers: [ConfigController],
  exports: [AppConfig, ConfigService],
})
export class ConfigModule {}
