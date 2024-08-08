import { faker } from '@faker-js/faker';
import { DataSource, Repository } from 'typeorm';

import {
  HabitableZonesEntity,
  HabitableZonesTypesEnum,
} from '~/modules/habitable-zones/entities/habitable-zones.entity';

// Szczecin
const cityBounds: [number, number][] = [
  [53.391874, 14.424565], // south, west point
  [53.516425, 14.653759], // north, east point
];

async function createHabitableZone(
  cityBounds: [number, number][],
  habitableZonesEntityRepository: Repository<HabitableZonesEntity>,
) {
  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const lat = randomInRange(cityBounds[0][0], cityBounds[1][0]);
  const lng = randomInRange(cityBounds[0][1], cityBounds[1][1]);

  const generateRandomPolygon = (
    centerLat: number,
    centerLng: number,
    variance: number,
  ): GeoJSON.Polygon => {
    const points = [];
    for (let i = 0; i < 4; i++) {
      const pointLat = faker.number.float({
        min: centerLat - variance,
        max: centerLat + variance,
      });
      const pointLng = faker.number.float({
        min: centerLng - variance,
        max: centerLng + variance,
      });
      points.push([pointLng, pointLat]);
    }
    points.push(points[0]); // close the polygon by repeating the first point
    return {
      type: 'Polygon',
      coordinates: [points],
    };
  };

  const area = generateRandomPolygon(lat, lng, 0.001);

  const types = [
    HabitableZonesTypesEnum.GOLD,
    HabitableZonesTypesEnum.WOOD,
    HabitableZonesTypesEnum.IRON,
  ];
  const newHabitableZone = habitableZonesEntityRepository.create({
    area,
    type: HabitableZonesTypesEnum[faker.helpers.arrayElement(types)],
  });

  return habitableZonesEntityRepository.save(newHabitableZone);
}

export async function seedHabitableZones(
  dataSource: DataSource,
): Promise<void> {
  const HOW_MANY = 500;
  const habitableZonesEntityRepository =
    dataSource.getRepository(HabitableZonesEntity);

  const promises = Array.from({ length: HOW_MANY }, (_, i) =>
    createHabitableZone(cityBounds, habitableZonesEntityRepository).then(() =>
      console.log(`created habitable zone ${i}`),
    ),
  );

  await Promise.all(promises);
}
