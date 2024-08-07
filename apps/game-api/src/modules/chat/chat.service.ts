import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesEntity } from 'shared-nestjs';
import { Repository } from 'typeorm';

import { ResponseMessageDto } from '~/modules/chat/dtos/response-message.dto';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(MessagesEntity)
    private messagesEntityRepository: Repository<MessagesEntity>,
  ) {}

  public async saveMessage(messageDto: ResponseMessageDto, user: ISessionUser) {
    this.logger.log(`NEW MESSAGE IN CONVERSATION ${messageDto.conversationId}`);
    try {
      await this.messagesEntityRepository.insert({
        user,
        content: messageDto.content,
        createdAt: messageDto.createdAt,
        conversation: { id: messageDto.conversationId },
      });
    } catch (error) {
      throw new ConflictException(
        `When inserting new chat message -- ERROR: ${error}`,
      );
    }
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
