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
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';
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
  private userUpdateTimestamps: Map<string, number> = new Map();
  @WebSocketServer()
  server: Server;

  constructor(
    private userLocationService: UserLocationService,
    private settlementsService: SettlementsService,
    private habitableZonesService: HabitableZonesService,
    private configService: ConfigService,
    private fogOfWarService: FogOfWarService,
    private wsJwtGuard: WsJwtGuard,
  ) {}

  @SubscribeMessage('playerPosition')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: IUpdateLocationParams,
  ) {
    if (!this.canActivateClient(client)) {
      client.disconnect();
      return;
    }

    try {
      await this.processPlayerPosition(client, payload);
    } catch (error) {
      this.handleError(client, payload.userId, error);
    }
  }

  private canActivateClient(client: Socket): boolean {
    return this.wsJwtGuard.canActivate({
      switchToWs: () => ({ getClient: () => client }),
    } as any);
  }

  private async processPlayerPosition(
    client: Socket,
    payload: IUpdateLocationParams,
  ) {
    const debounceTime = 1000; // 1 second
    const currentTime = Date.now();
    const lastUpdateTime = this.userUpdateTimestamps.get(payload.userId) || 0;

    if (currentTime - lastUpdateTime < debounceTime) {
      this.logger.log(
        `Debounced processPlayerPosition for user ID: ${payload.userId}`,
      );
      return;
    }
    this.userUpdateTimestamps.set(payload.userId, currentTime);

    await this.updatePlayerLocation(payload);

    this.getNearbyUsers(payload).then((nearbyUsers) => {
      client.emit('otherPlayersPositions', nearbyUsers);
    });

    this.getNearbySettlements(payload).then((nearbySettlements) => {
      this.discoverSettlements(payload.userId, nearbySettlements);
    });

    this.getNearbyHabitableZones(payload).then((nearbyHabitableZones) => {
      this.discoverHabitableZones(payload.userId, nearbyHabitableZones);
    });

    this.fogOfWarService
      .findAllDiscoveredByUser(payload.userId)
      .then((discovered) => {
        client.emit('allDiscoveredByUser', discovered);
      });

    this.fogOfWarService
      .findAllVisibleByUser(payload.userId)
      .then((visible) => {
        client.emit('allVisibleByUser', visible);
      });
  }

  private async updatePlayerLocation(payload: IUpdateLocationParams) {
    await this.userLocationService.updateLocation(payload);
  }

  private async getNearbyUsers(payload: IUpdateLocationParams) {
    const gameConfig = await this.configService.gameConfig();
    return this.userLocationService.getOnlineUsersInRadius(
      payload.location.lng,
      payload.location.lat,
      gameConfig.MAX_RADIUS_TO_DISCOVER_METERS,
      'm',
      [payload.userId],
    );
  }

  private async getNearbySettlements(payload: IUpdateLocationParams) {
    const gameConfig = await this.configService.gameConfig();
    return this.settlementsService.findSettlementsInRadius(
      payload.location,
      gameConfig.MAX_RADIUS_TO_DISCOVER_METERS,
    );
  }

  private async discoverSettlements(userId: string, settlements: any[]) {
    for (const settlement of settlements) {
      await this.fogOfWarService.discoverSettlement(userId, settlement);
    }
  }

  private async getNearbyHabitableZones(payload: IUpdateLocationParams) {
    const gameConfig = await this.configService.gameConfig();
    return this.habitableZonesService.findHabitableZonesInRadius(
      payload.location,
      gameConfig.MAX_RADIUS_TO_DISCOVER_METERS,
    );
  }

  private async discoverHabitableZones(userId: string, zones: any[]) {
    for (const zone of zones) {
      await this.fogOfWarService.discoverHabitableZone(userId, zone);
    }
  }

  private handleError(client: Socket, userId: string, error: any) {
    this.logger.error(
      `ERROR UPDATING LOCATION FOR USER: ${userId} --- ${error}`,
    );
    client.emit('location:error', error);
  }
}
