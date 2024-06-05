import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatGateway } from '~/modules/chat/chat.gateway';
import { ChatService } from '~/modules/chat/chat.service';
import { ConversationsEntity } from '~/modules/chat/entities/conversations.entity';
import { GroupsMembersEntity } from '~/modules/chat/entities/groups-members.entity';
import { GroupsEntity } from '~/modules/chat/entities/groups.entity';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { WsJwtGuard } from '~/modules/chat/guards/ws-jwt.guard';
import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';

import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationsEntity,
      GroupsEntity,
      GroupsMembersEntity,
      MessagesEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (appConfig: AppConfig) => ({
        secret: appConfig.get().JWT_SECRET,
        signOptions: {
          expiresIn: parseInt(appConfig.get().JWT_ACCESS_TOKEN_EXPIRES_IN),
        },
      }),
      inject: [AppConfig],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, WsJwtGuard, AppConfig, ChatService],
  exports: [],
})
export class ChatModule {}
