import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'shared-nestjs';

import { ConfigModule } from '~/modules/config/config.module';
import { PushNotificationsService } from '~/modules/push-notifications/push-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), ConfigModule],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
