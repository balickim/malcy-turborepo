import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { ConfigModule } from '~/modules/config/config.module';
import { ConfigService } from '~/modules/config/config.service';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { EventLogSubscriber } from '~/modules/event-log/event-log.subscriber';
import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';
import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, EventLogModule],
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
          entities: [EventLogEntity, HabitableZonesEntity, WorldsConfigEntity],
          subscribers: [EventLogSubscriber],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}
