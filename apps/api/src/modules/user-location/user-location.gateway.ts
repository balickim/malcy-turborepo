import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WsJwtGuard } from '~/modules/chat/guards/ws-jwt.guard';
import { ConfigService } from '~/modules/config/config.service';
import { FogOfWarService } from '~/modules/fog-of-war/fog-of-war.service';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import {
  IUpdateLocationParams,
  UserLocationService,
} from '~/modules/user-location/user-location.service';

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
  namespace: '/user-location',
})
export class UserLocationGateway {
  private readonly logger = new Logger(UserLocationGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private userLocationService: UserLocationService,
    private settlementsService: SettlementsService,
    private configService: ConfigService,
    private fogOfWarService: FogOfWarService,
    private wsJwtGuard: WsJwtGuard,
  ) {}

  @SubscribeMessage('playerPosition')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: IUpdateLocationParams,
  ) {
    if (
      !this.wsJwtGuard.canActivate({
        switchToWs: () => ({ getClient: () => client }),
      } as any)
    ) {
      client.disconnect();
      return;
    }

    try {
      await this.userLocationService.updateLocation(payload);
      this.logger.debug(`LOCATION UPDATED FOR USER: ${payload.userId}`);

      const nearbyUsers = await this.userLocationService.getOnlineUsersInRadius(
        payload.location.lng,
        payload.location.lat,
        this.configService.gameConfig.PLAYER_DISCOVER_RADIUS_METERS,
        'm',
        [payload.userId],
      );

      client.emit('otherPlayersPositions', nearbyUsers);

      const nearbySettlements =
        await this.settlementsService.findSettlementsInRadius(
          payload.location,
          this.configService.gameConfig.PLAYER_DISCOVER_RADIUS_METERS,
        );

      for (const settlement of nearbySettlements) {
        await this.fogOfWarService.discoverSettlement(
          payload.userId,
          settlement,
        );
      }

      client.emit(
        'allDiscoveredByUser',
        await this.fogOfWarService.findAllDiscoveredByUser(payload.userId),
      );
      client.emit(
        'allVisibleByUser',
        await this.fogOfWarService.findAllVisibleByUser(payload.userId),
      );
    } catch (e) {
      this.logger.error(
        `ERROR UPDATING LOCATION FOR USER: ${payload.userId} --- ${e}`,
      );
      client.emit('location:error', e);
    }
  }
}
