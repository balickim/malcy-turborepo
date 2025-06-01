import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import osmtogeojson from 'osmtogeojson';
import { lastValueFrom } from 'rxjs';
import {
  BackofficeHabitableZonesEntity,
  HabitableZonesTypesEnum,
  WorldsConfigEntity,
} from 'shared-nestjs';
import { Repository } from 'typeorm';

type OsmFeatureProperties = {
  [k: string]: any;
  id: string;
  landuse?: string;
  leisure?: string;
  natural?: string;
};

@Injectable()
export class GetFromOverpass {
  private readonly logger = new Logger(GetFromOverpass.name);

  constructor(
    @InjectRepository(WorldsConfigEntity)
    private readonly worldsConfigEntityRepository: Repository<WorldsConfigEntity>,
    @InjectRepository(BackofficeHabitableZonesEntity)
    private readonly backofficeHabitableZonesEntityRepository: Repository<BackofficeHabitableZonesEntity>,
    private readonly httpService: HttpService,
  ) {}

  async execute(worldName: string) {
    const worldConfig = await this.worldsConfigEntityRepository.findOne({
      where: { name: worldName },
    });

    if (!worldConfig) throw new Error(`World "${worldName}" not found`);

    const zones = await this.fetchOsmZones(worldConfig.config.WORLD_BOUNDS);

    const savePromises = zones.map(async (feature) => {
      // Optionally handle MultiPolygon -> Polygon
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry = {
          type: 'Polygon',
          coordinates: feature.geometry.coordinates[0],
        };
      }
      if (feature.geometry.type !== 'Polygon') {
        // Skip any non-Polygon geometry
        return;
      }

      const type = this.mapOsmToZoneType(
        feature.properties as OsmFeatureProperties,
      );

      // You may want to skip unknown or invalid types
      if (!type) return;

      const entity = this.backofficeHabitableZonesEntityRepository.create({
        area: feature.geometry,
        type,
        resourcesMultiplicator: 1,
        worldConfig: worldConfig,
        worldConfigId: worldConfig.id,
      });

      await this.backofficeHabitableZonesEntityRepository.save(entity);
      return entity;
    });

    // Execute all saves in parallel
    const createdZones = await Promise.all(savePromises);

    this.logger.log(`Created ${createdZones.length} zones from Overpass.`);
  }

  private async fetchOsmZones(bounds: [number, number][]) {
    const northEast = bounds[1];
    const southWest = bounds[3];
    const query = `
    [out:json][timeout:300];
    (
      way["leisure"="park"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["leisure"="garden"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["leisure"="nature_reserve"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["landuse"="forest"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["natural"="wood"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["natural"="grassland"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["natural"="meadow"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["landuse"="meadow"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      way["natural"="heath"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      relation["leisure"="park"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      relation["leisure"="nature_reserve"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      relation["landuse"="forest"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
      relation["natural"="wood"](${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]});
    );
    out body;
    >;
    out skel qt;
  `;

    const response = await lastValueFrom(
      this.httpService.post('https://overpass-api.de/api/interpreter', query, {
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    if (!response || !response.data)
      throw new Error('Failed to fetch OSM data');
    const osmJson = response.data;

    const geojson = osmtogeojson(osmJson);

    return geojson.features.filter(
      (f) =>
        f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon',
    );
  }

  private mapOsmToZoneType(
    properties: OsmFeatureProperties,
  ): HabitableZonesTypesEnum {
    if (properties.leisure === 'park') return HabitableZonesTypesEnum.WOOD;
    if (properties.leisure === 'garden') return HabitableZonesTypesEnum.WOOD;
    if (properties.leisure === 'nature_reserve')
      return HabitableZonesTypesEnum.WOOD;
    if (properties.landuse === 'forest' || properties.natural === 'wood')
      return HabitableZonesTypesEnum.WOOD;
    if (
      properties.natural === 'grassland' ||
      properties.natural === 'meadow' ||
      properties.landuse === 'meadow'
    )
      return HabitableZonesTypesEnum.GOLD;
    if (properties.natural === 'heath') return HabitableZonesTypesEnum.IRON;
    return HabitableZonesTypesEnum.IRON;
  }
}
