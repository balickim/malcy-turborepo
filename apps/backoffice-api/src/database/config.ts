import { DataSource, DataSourceOptions } from 'typeorm';

import { dataSourceOptions } from '~/database/config-dev';

export const databaseConfig: DataSourceOptions = {
  ...dataSourceOptions,
  migrations: ['dist/database/migrations/*.js'],
};

const dataSource = new DataSource(databaseConfig);

export default dataSource;
