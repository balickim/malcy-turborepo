import {
  EventLogEntity,
  WorldsConfigEntity,
  BackofficeHabitableZonesEntity,
} from 'shared-nestjs';
import { DataSource, DataSourceOptions } from 'typeorm';

import { AppConfig } from '../modules/config/appConfig';

const appConfig: AppConfig = new AppConfig();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  logging: false,
  synchronize: false,
  host: appConfig.get().BACKOFFICE_DB_HOST,
  port: appConfig.get().BACKOFFICE_DB_PORT,
  username: appConfig.get().BACKOFFICE_DB_USERNAME,
  password: appConfig.get().BACKOFFICE_DB_PASSWORD,
  database: appConfig.get().BACKOFFICE_DB_DATABASE,
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  entities: [
    EventLogEntity,
    BackofficeHabitableZonesEntity,
    WorldsConfigEntity,
  ],
  subscribers: [],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
