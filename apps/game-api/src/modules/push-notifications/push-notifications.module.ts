import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'shared-nestjs';

import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';
import { PushNotificationsController } from '~/modules/push-notifications/push-notifications.controller';
import { PushNotificationsService } from '~/modules/push-notifications/push-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), ConfigModule],
  controllers: [PushNotificationsController],
  providers: [AppConfig, PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
