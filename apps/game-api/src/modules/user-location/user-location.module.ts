import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WsSessionGuard } from '~/modules/chat/guards/ws-session.guard';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { HabitableZonesModule } from '~/modules/habitable-zones/habitable-zones.module';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationGateway } from '~/modules/user-location/user-location.gateway';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersModule } from '~/modules/users/users.module';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  imports: [
    CacheRedisProviderModule,
    TypeOrmModule.forFeature([EventLogEntity]),
    ConfigModule,
    UsersModule,
    forwardRef(() => FogOfWarModule),
    forwardRef(() => SettlementsModule),
    HabitableZonesModule,
  ],
  providers: [
    UserLocationService,
    UserLocationGateway,
    EventLogService,
    WsSessionGuard,
  ],
  exports: [UserLocationService],
})
export class UserLocationModule {}
