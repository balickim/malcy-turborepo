import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'shared-nestjs';

import { PushNotificationsService } from '~/modules/push-notifications/push-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
