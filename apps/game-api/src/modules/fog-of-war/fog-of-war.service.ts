import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  HabitableZonesTypesEnum,
  IDTOResponseFindHabitableZonesInBounds,
  UnitType,
} from 'shared-types';
import { Repository } from 'typeorm';

import { CombatsService } from '~/modules/combats/combats.service';
import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { DiscoveredHabitableZonesEntity } from '~/modules/habitable-zones/entities/discovered-habitable-zones.entity';
import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';
import { PublicSettlementDtoWithConvertedLocation } from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

@Injectable()
export class FogOfWarService {
  private readonly logger = new Logger(FogOfWarService.name);

  constructor(
    @InjectRepository(DiscoveredAreaEntity)
    private discoveredAreaEntityRepository: Repository<DiscoveredAreaEntity>,
    @InjectRepository(VisibleAreaEntity)
    private visibleAreaEntityRepository: Repository<VisibleAreaEntity>,
    @InjectRepository(DiscoveredSettlementsEntity)
    private discoveredSettlementsEntityRepository: Repository<DiscoveredSettlementsEntity>,
    @InjectRepository(DiscoveredHabitableZonesEntity)
    private discoveredHabitableZonesEntityRepository: Repository<DiscoveredHabitableZonesEntity>,
    @Inject(forwardRef(() => CombatsService))
    private combatsService: CombatsService,
  ) {}

  public async findAllDiscoveredByUser(userId: string) {
    const areas = await this.discoveredAreaEntityRepository
      .createQueryBuilder()
      .select('ST_AsGeoJSON((ST_Dump(area)).geom)::json', 'area')
      .where('"userId" = :userId', { userId })
      .getRawMany();

    const convertedAreas = areas.map((result) => {
      const geoJson = result.area;

      if (geoJson.type === 'Polygon') {
        return geoJson.coordinates[0].map(([lng, lat]) => [lat, lng]);
      } else {
        console.warn('Unexpected GeoJSON type:', geoJson.type);
        return [];
      }
    });

    return convertedAreas;
  }

  public async findAllVisibleByUser(userId: string) {
    const areas = await this.visibleAreaEntityRepository
      .createQueryBuilder()
      .select('ST_AsGeoJSON((ST_Dump(area)).geom)::json', 'area')
      .where('"userId" = :userId', { userId })
      .getRawMany();

    const convertedAreas = areas.map((result) => {
      const geoJson = result.area;

      if (geoJson.type === 'Polygon') {
        return geoJson.coordinates[0].map(([lng, lat]) => [lat, lng]);
      } else {
        console.warn('Unexpected GeoJSON type:', geoJson.type);
        return [];
      }
    });

    return convertedAreas;
  }

  public async updateDiscoveredArea(
    userId: string,
    lat: number,
    lng: number,
    radiusInMeters: number,
  ) {
    await this.updateVisibleArea(userId, lat, lng, radiusInMeters);

    const newPolygon = () =>
      `ST_Buffer(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusInMeters})::geometry`;

    const discoveredArea = await this.discoveredAreaEntityRepository.findOne({
      where: { userId },
    });

    if (discoveredArea) {
      await this.discoveredAreaEntityRepository
        .createQueryBuilder()
        .update(DiscoveredAreaEntity)
        .set({
          area: () => `ST_Multi(ST_Union(area, ${newPolygon()}))`,
        })
        .where('id = :id', { id: discoveredArea.id })
        .execute();
    } else {
      // @ts-expect-error area needs to be executed () =>
      const newArea = this.discoveredAreaEntityRepository.create({
        userId,
        area: () => newPolygon(),
      });

      await this.discoveredAreaEntityRepository.save(newArea);
    }
  }

  public async updateVisibleArea(
    userId: string,
    lat: number,
    lng: number,
    radiusInMeters: number,
  ) {
    const newPolygon = () =>
      `ST_Buffer(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusInMeters})::geometry`;

    const visibleArea = await this.visibleAreaEntityRepository.findOne({
      where: { userId },
    });

    if (visibleArea) {
      await this.visibleAreaEntityRepository
        .createQueryBuilder()
        .update(VisibleAreaEntity)
        .set({
          area: () => newPolygon(),
        })
        .where('id = :id', { id: visibleArea.id })
        .execute();
    } else {
      // @ts-expect-error area needs to be executed () =>
      const newArea = this.visibleAreaEntityRepository.create({
        userId,
        area: () => newPolygon(),
      });

      await this.visibleAreaEntityRepository.save(newArea);
    }
  }

  public async discoverSettlement(
    discoveredByUserId: string,
    settlement: SettlementsEntity,
  ) {
    const recordToUpsert: Partial<DiscoveredSettlementsEntity> = {
      discoveredByUserId,
      userId: settlement.user.id,
      settlementId: settlement.id,
      type: settlement.type,
      [UnitType.SWORDSMAN]: settlement.army[UnitType.SWORDSMAN],
      [UnitType.ARCHER]: settlement.army[UnitType.ARCHER],
      [UnitType.KNIGHT]: settlement.army[UnitType.KNIGHT],
      [UnitType.LUCHADOR]: settlement.army[UnitType.LUCHADOR],
      [UnitType.ARCHMAGE]: settlement.army[UnitType.ARCHMAGE],
    };

    return this.discoveredSettlementsEntityRepository.upsert(recordToUpsert, {
      conflictPaths: ['settlementId', 'discoveredByUserId'],
    });
  }

  public async discoverHabitableZone(
    discoveredByUserId: string,
    habitableZone: HabitableZonesEntity,
  ) {
    const recordToUpsert: Partial<DiscoveredHabitableZonesEntity> = {
      discoveredByUserId,
      type: habitableZone.type,
      habitableZoneId: habitableZone.id,
    };

    return this.discoveredHabitableZonesEntityRepository.upsert(
      recordToUpsert,
      {
        conflictPaths: ['habitableZoneId', 'discoveredByUserId'],
      },
    );
  }

  async findSettlementsInBounds(
    discoveredByUserId: string,
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<PublicSettlementDtoWithConvertedLocation[]> {
    try {
      const query = this.discoveredSettlementsEntityRepository
        .createQueryBuilder('ds')
        .select([
          'ds.settlementId AS id',
          'ds.type AS type',
          'settlement.name AS name',
          'ds.swordsman AS swordsman',
          'ds.archer AS archer',
          'ds.knight AS knight',
          'ds.luchador AS luchador',
          'ds.archmage AS archmage',
          'ST_X(settlement.location) AS lng',
          'ST_Y(settlement.location) AS lat',
          'user.id AS user_id',
          'user.username AS user_username',
        ])
        .leftJoin('ds.settlement', 'settlement')
        .leftJoinAndSelect('settlement.user', 'user')
        .where('ds.discoveredByUserId = :discoveredByUserId', {
          discoveredByUserId,
        })
        .andWhere(
          `settlement.location && ST_MakeEnvelope(:southWestLng, :southWestLat, :northEastLng, :northEastLat, 4326)`,
          {
            southWestLng: southWest.lng,
            southWestLat: southWest.lat,
            northEastLng: northEast.lng,
            northEastLat: northEast.lat,
          },
        );

      const rawResults = await query.getRawMany();

      const results = await Promise.all(
        rawResults.map(async (result) => {
          const siege = await this.combatsService.getSiegeBySettlementId(
            result.id,
          );
          return {
            id: result.id,
            name: result.name,
            type: result.type,
            lng: result.lng,
            lat: result.lat,
            [UnitType.SWORDSMAN]: result[UnitType.SWORDSMAN],
            [UnitType.ARCHER]: result[UnitType.ARCHER],
            [UnitType.KNIGHT]: result[UnitType.KNIGHT],
            [UnitType.LUCHADOR]: result[UnitType.LUCHADOR],
            [UnitType.ARCHMAGE]: result[UnitType.ARCHMAGE],
            user: {
              id: result.user_id,
              username: result.user_username,
            },
            siege,
          };
        }),
      );

      return results;
    } catch (e) {
      this.logger.error(
        `FINDING SETTLEMENTS IN BOUNDS southWest.lat:${southWest.lat}, southWest.lng:${southWest.lng}, northEast.lat:${northEast.lat}, northEast.lng:${northEast.lng} FAILED: ${e}`,
      );
    }
  }

  async findHabitableZonesInBounds(
    discoveredByUserId: string,
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<IDTOResponseFindHabitableZonesInBounds[]> {
    try {
      const query = this.discoveredHabitableZonesEntityRepository
        .createQueryBuilder('dhz')
        .select([
          'dhz.habitableZoneId AS id',
          'dhz.type AS type',
          'ST_AsGeoJSON((ST_Dump(hz.area)).geom)::json AS area',
        ])
        .leftJoin('dhz.habitableZone', 'hz')
        .where('dhz.discoveredByUserId = :discoveredByUserId', {
          discoveredByUserId,
        })
        .andWhere(
          `ST_Intersects(hz.area, ST_MakeEnvelope(:southWestLng, :southWestLat, :northEastLng, :northEastLat, 4326))`,
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
      throw e; // Ensure the error is propagated
    }
  }

  async getDiscoveredSettlementById(id: string, user: ISessionUser) {
    return this.discoveredSettlementsEntityRepository.findOne({
      select: [
        'settlementId',
        'discoveredByUserId',
        'userId',
        'type',
        'user',
        UnitType.SWORDSMAN,
        UnitType.ARCHER,
        UnitType.KNIGHT,
        UnitType.LUCHADOR,
        UnitType.ARCHMAGE,
      ],
      where: { settlementId: id, discoveredByUserId: user.id },
    });
  }
}
