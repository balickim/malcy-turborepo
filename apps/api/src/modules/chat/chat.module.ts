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
import { ConfigModule } from '~/modules/config/config.module';
import { ConfigService } from '~/modules/config/config.service';

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
      useFactory: async (configService: ConfigService) => ({
        secret: configService.appConfig.JWT_SECRET,
        signOptions: {
          expiresIn: parseInt(
            configService.appConfig.JWT_ACCESS_TOKEN_EXPIRES_IN,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, WsJwtGuard, ConfigService, ChatService],
  exports: [],
})
export class ChatModule {}
