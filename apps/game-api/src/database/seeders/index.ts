import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '~/app.module';
import { seedHabitableZones } from '~/database/seeders/seedHabitableZones';
import { seedSettlements } from '~/database/seeders/seedSettlements';

async function runSeeder() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  await seedSettlements(dataSource);
  await seedHabitableZones(dataSource);

  await app.close();
}
runSeeder();
