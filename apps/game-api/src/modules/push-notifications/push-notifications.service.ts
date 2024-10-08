import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { UsersEntity } from 'shared-nestjs';
import { Repository } from 'typeorm';

import { AppConfig } from '~/modules/config/appConfig';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
    private appConfig: AppConfig,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.appConfig.get().GAME_FIREBASE_PROJECT_ID,
        clientEmail: this.appConfig.get().GAME_FIREBASE_CLIENT_EMAIL,
        privateKey: this.appConfig
          .get()
          .GAME_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  async sendNotificationToUser(
    userId: string,
    notification: admin.messaging.Notification,
  ): Promise<void> {
    try {
      const user = await this.usersRepository.findOne({
        select: ['registrationToken'],
        where: { id: userId },
      });
      if (!user || !user.registrationToken) {
        this.logger.warn(`No registration token found for user ${userId}`);
        return;
      }

      const message: admin.messaging.Message = {
        token: user.registrationToken,
        notification: notification,
      };

      await admin.messaging().send(message);
      this.logger.debug(`Notification sent successfully to user ${userId}`);
    } catch (error) {
      this.logger.error('Error sending notification:', error);
    }
  }

  async updateToken(userId: string, token: string): Promise<void> {
    try {
      await this.usersRepository.update(
        { id: userId },
        { registrationToken: token },
      );

      this.logger.debug(`Push notification token updated for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error updating token:', error);
    }
  }
}
