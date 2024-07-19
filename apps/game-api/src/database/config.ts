import {
  ArmyEntity,
  ConversationsEntity,
  DiscoveredAreaEntity,
  DiscoveredHabitableZonesEntity,
  DiscoveredSettlementsEntity,
  EventLogEntity,
  GroupsEntity,
  GroupsMembersEntity,
  HabitableZonesEntity,
  MessagesEntity,
  SettlementsEntity,
  UsersEntity,
  VisibleAreaEntity,
} from 'shared-nestjs';
import { DataSource, DataSourceOptions } from 'typeorm';

import { AppConfig } from '../modules/config/appConfig';
import { EventLogSubscriber } from '../modules/event-log/event-log.subscriber';

const appConfig: AppConfig = new AppConfig();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  logging: false,
  synchronize: appConfig.get().GAME_DB_SYNCHRONIZE,
  host: appConfig.get().GAME_DB_HOST,
  port: appConfig.get().GAME_DB_PORT,
  username: appConfig.get().GAME_DB_USERNAME,
  password: appConfig.get().GAME_DB_PASSWORD,
  database: appConfig.get().GAME_DB_DATABASE,
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  entities: [
    DiscoveredAreaEntity,
    VisibleAreaEntity,
    DiscoveredSettlementsEntity,
    HabitableZonesEntity,
    DiscoveredHabitableZonesEntity,
    UsersEntity,
    SettlementsEntity,
    ArmyEntity,
    EventLogEntity,
    ConversationsEntity,
    GroupsEntity,
    GroupsMembersEntity,
    MessagesEntity,
  ],
  subscribers: [EventLogSubscriber],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
