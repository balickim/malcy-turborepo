import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WsSessionGuard } from '~/modules/chat/guards/ws-session.guard';
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
export class UserLocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
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
    private wsSessionGuard: WsSessionGuard,
  ) {}

  afterInit() {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Handshake data: ${JSON.stringify(client.handshake)}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('playerPosition')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: IUpdateLocationParams,
  ) {
    const canActivateClient = await this.canActivateClient(client);
    if (!canActivateClient) {
      this.logger.warn(`Client not authorized: ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      await this.processPlayerPosition(client, payload);
    } catch (error) {
      this.handleError(client, payload.userId, error);
    }
  }

  private async canActivateClient(client: Socket): Promise<boolean> {
    const isAuthorized = await this.wsSessionGuard.canActivate({
      switchToWs: () => ({ getClient: () => client }),
    } as any);

    if (!isAuthorized) {
      this.logger.warn(`Client session invalid or expired: ${client.id}`);
    }

    return isAuthorized;
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

    await this.userLocationService.updatePlayerLocation(payload);

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

  private async getNearbyUsers(payload: IUpdateLocationParams) {
    const worldConfig = await this.configService.worldConfig();
    return this.userLocationService.getOnlineUsersInRadius(
      payload.location.lng,
      payload.location.lat,
      worldConfig.MAX_RADIUS_TO_DISCOVER_METERS,
      'm',
      [payload.userId],
    );
  }

  private async getNearbySettlements(payload: IUpdateLocationParams) {
    const worldConfig = await this.configService.worldConfig();
    return this.settlementsService.findSettlementsInRadiusWithDeleted(
      payload.location,
      worldConfig.MAX_RADIUS_TO_DISCOVER_METERS,
    );
  }

  private async discoverSettlements(userId: string, settlements: any[]) {
    for (const settlement of settlements) {
      await this.fogOfWarService.discoverSettlement(userId, settlement);
    }
  }

  private async getNearbyHabitableZones(payload: IUpdateLocationParams) {
    const worldConfig = await this.configService.worldConfig();
    return this.habitableZonesService.findHabitableZonesInRadius(
      payload.location,
      worldConfig.MAX_RADIUS_TO_DISCOVER_METERS,
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
