import { Repository } from 'typeorm';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function includeAll<T extends object>(
  repository: Repository<T>,
): Array<keyof T> {
  return repository.metadata.columns.map((col) => col.propertyName) as Array<
    keyof T
  >;
}

export function include<T extends object>(
  repository: Repository<T>,
  unselectedColumnsToAdd: Array<keyof T>,
): Array<keyof T> {
  return repository.metadata.columns
    .filter(
      (col) =>
        col.isSelect ||
        (!col.isSelect &&
          unselectedColumnsToAdd.includes(col.propertyName as keyof T)),
    )
    .map((col) => col.propertyName) as Array<keyof T>;
}

export function gameWorldDbConfig(worldName: string) {
  const host = process.env[`${worldName}_DB_HOST`];
  const port = parseInt(process.env[`${worldName}_DB_PORT`], 10) || 5432;
  const username = process.env[`${worldName}_DB_USERNAME`];
  const password = process.env[`${worldName}_DB_PASSWORD`];
  const database = process.env[`${worldName}_DB_DATABASE`];

  if (!host)
    console.error(`Missing environment variable: ${worldName}_DB_HOST`);
  if (!username)
    console.error(`Missing environment variable: ${worldName}_DB_USERNAME`);
  if (!password)
    console.error(`Missing environment variable: ${worldName}_DB_PASSWORD`);
  if (!database)
    console.error(`Missing environment variable: ${worldName}_DB_DATABASE`);

  return {
    host,
    port,
    username,
    password,
    database,
  };
}
