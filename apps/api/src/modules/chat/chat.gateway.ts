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
import { WsJwtGuard } from '~/modules/chat/guards/ws-jwt.guard';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

export interface SocketWithUser extends Socket {
  user: IJwtUser;
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
  @WebSocketServer()
  server: Server;

  constructor(
    private wsJwtGuard: WsJwtGuard,
    private chatService: ChatService,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: RequestMessageDto,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    if (
      !this.wsJwtGuard.canActivate({
        switchToWs: () => ({ getClient: () => client }),
      } as any)
    ) {
      client.disconnect();
      return;
    }

    const newMessage = this.createMessage(data, client.user);
    this.chatService.saveMessage(newMessage, client.user);

    this.server
      // .to(`conversation_${data.conversationId}`)
      .emit('newMessage', newMessage);
  }

  createMessage(data: RequestMessageDto, user: IJwtUser): ResponseMessageDto {
    return {
      ...data,
      createdAt: new Date(),
      user,
    };
  }
}
