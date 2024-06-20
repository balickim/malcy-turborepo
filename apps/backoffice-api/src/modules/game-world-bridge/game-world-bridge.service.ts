import { Injectable } from '@nestjs/common';
// import {
//   UsersEntity,
//   SettlementsEntity,
//   ArmyEntity,
//   EventLogEntity,
//   ConversationsEntity,
//   GroupsEntity,
//   GroupsMembersEntity,
//   MessagesEntity,
//   HabitableZonesEntity,
//   DiscoveredSettlementsEntity,
//   DiscoveredAreaEntity,
//   VisibleAreaEntity,
//   DiscoveredHabitableZonesEntity,
// } from 'shared-nestjs';
import { DataSource, DataSourceOptions } from 'typeorm';

import { gameWorldDbConfig } from '~/common/utils';

@Injectable()
export class GameWorldBridgeService {
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
      // entities: Object.values(entities),
      entities: [
        // UsersEntity,
        // SettlementsEntity,
        // ArmyEntity,
        // EventLogEntity,
        // ConversationsEntity,
        // GroupsEntity,
        // GroupsMembersEntity,
        // MessagesEntity,
        // HabitableZonesEntity,
        // DiscoveredSettlementsEntity,
        // DiscoveredAreaEntity,
        // VisibleAreaEntity,
        // DiscoveredHabitableZonesEntity,
      ],
      synchronize: false,
    };

    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();
    this.dataSources.set(worldName, dataSource);

    return dataSource;
  }

  // async getSettlements(worldName: string): Promise<SettlementsEntity[]> {
  //   const dataSource = await this.connectToGameDatabase(worldName);
  //   const settlementsRepository: Repository<SettlementsEntity> =
  //     dataSource.getRepository(SettlementsEntity);
  //   return settlementsRepository.find({ take: 10 });
  // }
}
