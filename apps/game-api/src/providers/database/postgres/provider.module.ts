import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConversationsEntity } from '~/modules/chat/entities/conversations.entity';
import { GroupsMembersEntity } from '~/modules/chat/entities/groups-members.entity';
import { GroupsEntity } from '~/modules/chat/entities/groups.entity';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { EventLogSubscriber } from '~/modules/event-log/event-log.subscriber';
import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { DiscoveredHabitableZonesEntity } from '~/modules/habitable-zones/entities/discovered-habitable-zones.entity';
import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';
import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        SettlementsModule,
        UsersModule,
        UserLocationModule,
        EventLogModule,
        FogOfWarModule,
      ],
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig) => {
        return {
          type: 'postgres',
          host: appConfig.get().GAME_DB_HOST,
          port: appConfig.get().GAME_DB_PORT,
          username: appConfig.get().GAME_DB_USERNAME,
          password: appConfig.get().GAME_DB_PASSWORD,
          database: appConfig.get().GAME_DB_DATABASE,
          migrations: [],
          migrationsTableName: 'typeorm_migrations',
          synchronize: appConfig.get().GAME_DB_SYNCHRONIZE,
          entities: [
            UsersEntity,
            SettlementsEntity,
            ArmyEntity,
            EventLogEntity,
            ConversationsEntity,
            GroupsEntity,
            GroupsMembersEntity,
            MessagesEntity,
            DiscoveredAreaEntity,
            VisibleAreaEntity,
            DiscoveredSettlementsEntity,
            HabitableZonesEntity,
            DiscoveredHabitableZonesEntity,
          ],
          subscribers: [EventLogSubscriber],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}
