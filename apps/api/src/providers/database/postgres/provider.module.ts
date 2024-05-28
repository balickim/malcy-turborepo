import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConversationsEntity } from '~/modules/chat/entities/conversations.entity';
import { GroupsMembersEntity } from '~/modules/chat/entities/groups-members.entity';
import { GroupsEntity } from '~/modules/chat/entities/groups.entity';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { ConfigService } from '~/modules/config/config.service';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { EventLogSubscriber } from '~/modules/event-log/event-log.subscriber';
import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
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
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.appConfig.DB_HOST,
          port: configService.appConfig.DB_PORT,
          username: configService.appConfig.DB_USERNAME,
          password: configService.appConfig.DB_PASSWORD,
          database: configService.appConfig.DB_DATABASE,
          migrations: [],
          migrationsTableName: 'typeorm_migrations',
          synchronize: configService.appConfig.DB_SYNCHRONIZE,
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
          ],
          subscribers: [EventLogSubscriber],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}
