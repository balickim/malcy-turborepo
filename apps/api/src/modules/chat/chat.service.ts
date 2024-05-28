import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResponseMessageDto } from '~/modules/chat/dtos/response-message.dto';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(MessagesEntity)
    private messagesEntityRepository: Repository<MessagesEntity>,
  ) {}

  public async saveMessage(messageDto: ResponseMessageDto, user: IJwtUser) {
    this.logger.log(`NEW MESSAGE IN CONVERSATION ${messageDto.conversationId}`);
    return this.messagesEntityRepository.insert({
      user,
      content: messageDto.content,
      createdAt: messageDto.createdAt,
      conversation: { id: messageDto.conversationId },
    });
  }

  public async getMessagesByConversationId(
    conversationId: number,
    pageNumber: number,
  ) {
    const pageSize = 10;
    const [result] = await this.messagesEntityRepository.findAndCount({
      where: { conversation: { id: conversationId } },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize + 1,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    const hasNextPage = result.length > pageSize;
    const messages = hasNextPage ? result.slice(0, -1) : result;

    return {
      messages,
      nextPage: hasNextPage ? Number(pageNumber) + 1 : undefined,
    };
  }
}
