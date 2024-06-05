import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WsJwtGuard } from '~/modules/chat/guards/ws-jwt.guard';
import { AppConfig } from '~/modules/config/appConfig';
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: AppConfig) => ({
        secret: configService.appConfig.JWT_SECRET,
        signOptions: {
          expiresIn: parseInt(
            configService.appConfig.JWT_ACCESS_TOKEN_EXPIRES_IN,
          ),
        },
      }),
      inject: [AppConfig],
    }),
  ],
  providers: [
    UserLocationService,
    UserLocationGateway,
    EventLogService,
    WsJwtGuard,
  ],
  exports: [UserLocationService],
})
export class UserLocationModule {}
