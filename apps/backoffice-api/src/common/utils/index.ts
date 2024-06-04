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
