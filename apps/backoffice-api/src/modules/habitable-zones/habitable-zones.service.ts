import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  HabitableZonesTypesEnum,
  IDTOResponseFindHabitableZonesInBounds,
} from 'shared-types';
import { Repository } from 'typeorm';

import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';

@Injectable()
export class HabitableZonesService {
  private readonly logger = new Logger(HabitableZonesService.name);

  constructor(
    @InjectRepository(HabitableZonesEntity)
    private habitableZonesEntityRepository: Repository<HabitableZonesEntity>,
  ) {}

  async findHabitableZonesInBounds(
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<IDTOResponseFindHabitableZonesInBounds[]> {
    try {
      const query = this.habitableZonesEntityRepository
        .createQueryBuilder('dhz')
        .select([
          'dhz.id AS id',
          'dhz.type AS type',
          'ST_AsGeoJSON((ST_Dump(dhz.area)).geom)::json AS area',
        ])
        .leftJoin('dhz.worldConfig', 'wc')
        .where(
          `ST_Intersects(dhz.area, ST_MakeEnvelope(:southWestLng, :southWestLat, :northEastLng, :northEastLat, 4326))`,
          {
            southWestLng: southWest.lng,
            southWestLat: southWest.lat,
            northEastLng: northEast.lng,
            northEastLat: northEast.lat,
          },
        );

      const rawResults = await query.getRawMany();

      const results = rawResults.map((result) => {
        const geoJson = result.area;

        if (geoJson.type === 'Polygon') {
          const convertedCoordinates = geoJson.coordinates[0].map(
            ([lng, lat]) => [lat, lng],
          );
          return {
            id: result.id as string,
            type: result.type as HabitableZonesTypesEnum,
            area: convertedCoordinates as number[],
          };
        } else {
          this.logger.warn('Unexpected GeoJSON type:', geoJson.type);
          return {
            id: result.id,
            type: result.type,
            area: [],
          };
        }
      });

      return results;
    } catch (e) {
      this.logger.error(
        `FINDING HABITABLE ZONES IN BOUNDS southWest.lat:${southWest.lat}, southWest.lng:${southWest.lng}, northEast.lat:${northEast.lat}, northEast.lng:${northEast.lng} FAILED: ${e}`,
      );
      throw e;
    }
  }

  public async createHabitableZone(data: HabitableZonesEntity) {
    const newHabitableZone = this.habitableZonesEntityRepository.create(data);

    return this.habitableZonesEntityRepository.save(newHabitableZone);
  }
}
