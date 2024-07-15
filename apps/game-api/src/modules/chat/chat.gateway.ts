import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from '~/modules/chat/chat.service';
import { RequestMessageDto } from '~/modules/chat/dtos/request-message.dto';
import { ResponseMessageDto } from '~/modules/chat/dtos/response-message.dto';
import { WsSessionGuard } from '~/modules/chat/guards/ws-session.guard';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

export interface SocketWithUser extends Socket {
  user: ISessionUser;
}

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FE_APP_HOST,
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'http://localhost:5173',
      'http://localhost:8090',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private wsSessionGuard: WsSessionGuard,
    private chatService: ChatService,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: RequestMessageDto,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    const canActivate = await this.wsSessionGuard.canActivate({
      switchToWs: () => ({ getClient: () => client }),
    } as any);
    if (!canActivate) {
      client.disconnect();
      return;
    }

    const newMessage = this.createMessage(data, client.user);
    try {
      await this.chatService.saveMessage(newMessage, client.user);
      this.server.emit('newMessage', newMessage);
    } catch (error) {
      this.logger.error(error);
      this.server.emit('error', 'There was an error when sending a message');
    }
  }

  createMessage(
    data: RequestMessageDto,
    user: ISessionUser,
  ): ResponseMessageDto {
    return {
      ...data,
      createdAt: new Date(),
      user,
    };
  }
}
