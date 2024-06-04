import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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
})
export class SettlementsGateway {
  @WebSocketServer()
  server: Server;
}
