import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { ArmyEntity, SettlementsEntity, UsersEntity } from 'shared-nestjs';
import { UnitType } from 'shared-types';
import { DataSource, Repository } from 'typeorm';

async function createUser(usersRepository: Repository<UsersEntity>) {
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = new UsersEntity();
  user.username = faker.internet.userName();
  user.email = faker.internet.email();
  user.password = hashedPassword;

  return usersRepository.save(user);
}

// Szczecin
const cityBounds: [number, number][] = [
  [53.391874, 14.424565], // south, west point
  [53.516425, 14.653759], // north, east point
];

async function createSettlement(
  cityBounds: [number, number][],
  user: UsersEntity,
  settlementsEntityRepository: Repository<SettlementsEntity>,
) {
  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const lat = randomInRange(cityBounds[0][0], cityBounds[1][0]);
  const lng = randomInRange(cityBounds[0][1], cityBounds[1][1]);
  const name = faker.lorem.words(2);

  const location: GeoJSON.Point = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  const newSettlement = settlementsEntityRepository.create({
    name: name,
    location,
    user,
  });

  return settlementsEntityRepository.save(newSettlement);
}

async function createArmy(
  armyEntityRepository: Repository<ArmyEntity>,
  settlement?: SettlementsEntity,
  user?: UsersEntity,
) {
  const newArmy = armyEntityRepository.create({
    [UnitType.SWORDSMAN]: faker.number.int({ min: 0, max: 1000 }),
    [UnitType.ARCHER]: faker.number.int({ min: 0, max: 1000 }),
    settlement,
    user,
  });

  await armyEntityRepository.save(newArmy);
}

export async function seedSettlements(dataSource: DataSource): Promise<void> {
  const settlementsEntityRepository =
    dataSource.getRepository(SettlementsEntity);
  const usersEntityRepository = dataSource.getRepository(UsersEntity);
  const armyEntityRepository = dataSource.getRepository(ArmyEntity);
  const HOW_MANY_USERS = 100;
  const HOW_MANY_SETTLEMENTS_FOR_EACH_USER = 5;

  const userPromises = Array.from({ length: HOW_MANY_USERS }, async (_, i) => {
    const user = await createUser(usersEntityRepository);
    await createArmy(armyEntityRepository, undefined, user);
    console.log(`created user ${i}`);

    const settlementPromises = Array.from(
      { length: HOW_MANY_SETTLEMENTS_FOR_EACH_USER },
      async (_, j) => {
        const settlement = await createSettlement(
          cityBounds,
          user,
          settlementsEntityRepository,
        );
        await createArmy(armyEntityRepository, settlement);
        console.log(`created settlement and army ${j} for user ${i}`);
      },
    );

    await Promise.all(settlementPromises);
  });

  await Promise.all(userPromises);
}
