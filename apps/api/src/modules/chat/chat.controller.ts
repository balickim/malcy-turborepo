import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ChatService } from '~/modules/chat/chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':conversationId/:page')
  async getMessagesInConversation(
    @Param('conversationId') conversationId: number,
    @Param('page') page: number,
  ) {
    return this.chatService.getMessagesByConversationId(conversationId, page);
  }
}
