import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatGateway } from '~/modules/chat/chat.gateway';
import { ChatService } from '~/modules/chat/chat.service';
import { ConversationsEntity } from '~/modules/chat/entities/conversations.entity';
import { GroupsMembersEntity } from '~/modules/chat/entities/groups-members.entity';
import { GroupsEntity } from '~/modules/chat/entities/groups.entity';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { WsSessionGuard } from '~/modules/chat/guards/ws-session.guard';
import { AppConfig } from '~/modules/config/appConfig';

import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationsEntity,
      GroupsEntity,
      GroupsMembersEntity,
      MessagesEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, WsSessionGuard, AppConfig, ChatService],
})
export class ChatModule {}
