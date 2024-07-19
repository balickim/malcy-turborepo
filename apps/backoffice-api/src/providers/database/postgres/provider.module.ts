import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { EventLogEntity } from 'shared-nestjs';

import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { EventLogSubscriber } from '~/modules/event-log/event-log.subscriber';
import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';
import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, EventLogModule],
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig) => {
        return {
          type: 'postgres',
          host: appConfig.get().BACKOFFICE_DB_HOST,
          port: appConfig.get().BACKOFFICE_DB_PORT,
          username: appConfig.get().BACKOFFICE_DB_USERNAME,
          password: appConfig.get().BACKOFFICE_DB_PASSWORD,
          database: appConfig.get().BACKOFFICE_DB_DATABASE,
          migrations: [],
          migrationsTableName: 'typeorm_migrations',
          synchronize: appConfig.get().BACKOFFICE_DB_SYNCHRONIZE,
          entities: [EventLogEntity, HabitableZonesEntity, WorldsConfigEntity],
          subscribers: [EventLogSubscriber],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}
