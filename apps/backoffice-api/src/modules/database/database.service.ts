import { Injectable } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

import { gameWorldDbConfig } from '~/common/utils';

import { EventLogEntity } from '../event-log/entities/event-log.entity';
import { HabitableZonesEntity } from '../habitable-zones/entities/habitable-zones.entity';
import {
  ArmyEntity,
  ConversationsEntity,
  DiscoveredSettlementsEntity,
  GroupsEntity,
  GroupsMembersEntity,
  MessagesEntity,
  SettlementsEntity,
  UsersEntity,
} from './game.entities';

@Injectable()
export class DatabaseService {
  private dataSources: Map<string, DataSource> = new Map();

  async connectToGameDatabase(worldName: string): Promise<DataSource> {
    if (this.dataSources.has(worldName)) {
      return this.dataSources.get(worldName);
    }

    const { host, port, username, password, database } =
      gameWorldDbConfig(worldName);

    const dataSourceOptions: DataSourceOptions = {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [
        UsersEntity,
        SettlementsEntity,
        ArmyEntity,
        EventLogEntity,
        ConversationsEntity,
        GroupsEntity,
        GroupsMembersEntity,
        MessagesEntity,
        DiscoveredSettlementsEntity,
        HabitableZonesEntity,
      ],
      synchronize: false,
    };

    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();
    this.dataSources.set(worldName, dataSource);

    return dataSource;
  }
}
