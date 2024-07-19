import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversationsEntity,
  GroupsEntity,
  GroupsMembersEntity,
  MessagesEntity,
} from 'shared-nestjs';

import { ChatGateway } from '~/modules/chat/chat.gateway';
import { ChatService } from '~/modules/chat/chat.service';
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
