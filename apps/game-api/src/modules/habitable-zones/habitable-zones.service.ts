import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, firstValueFrom } from 'rxjs';
import {
  DiscoveredHabitableZonesEntity,
  HabitableZonesEntity,
} from 'shared-nestjs';
import { Repository } from 'typeorm';

import { AppConfig } from '~/modules/config/appConfig';

@Injectable()
export class HabitableZonesService implements OnModuleInit {
  private readonly logger = new Logger(HabitableZonesService.name);

  constructor(
    @InjectRepository(HabitableZonesEntity)
    private habitableZonesEntityRepository: Repository<HabitableZonesEntity>,
    @InjectRepository(DiscoveredHabitableZonesEntity)
    private discoveredHabitableZonesEntityRepository: Repository<DiscoveredHabitableZonesEntity>,
    private readonly httpService: HttpService,
    private appConfig: AppConfig,
  ) {}

  async onModuleInit() {
    try {
      const habitableZones = await this.retrieveHabitableZones();
      await this.saveDownloadedHabitableZones(habitableZones);
    } catch (err) {
      this.logger.error('Failed to initialize habitable zones:', err);
    }
  }

  private async saveDownloadedHabitableZones(habitableZones: any[]) {
    this.logger.log('⏳ Loading habitable zones...');

    const batchSize = 5000;
    const total = habitableZones.length;
    const numBatches = Math.ceil(total / batchSize);

    for (let i = 0; i < total; i += batchSize) {
      const batchNum = Math.floor(i / batchSize) + 1;
      this.logger.log(`Processing batch ${batchNum} out of ${numBatches}...`);
      const batch = habitableZones.slice(i, i + batchSize);
      await this.habitableZonesEntityRepository.upsert(batch, ['id']);
    }

    this.logger.log('✅ Loading habitable zones FINISHED');
  }

  private async retrieveHabitableZones(): Promise<any> {
    const apiKey = this.appConfig.get().BACKOFFICE_API_KEY;
    const { data } = await firstValueFrom(
      this.httpService
        .get<{ data: any }>(
          this.appConfig.get().BACKOFFICE_HOST +
            '/habitable-zones/download/' +
            this.appConfig.get().WORLD_NAME,
          {
            headers: {
              'x-api-key': apiKey,
            },
          },
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data.data;
  }

  public async findHabitableZonesInRadius(
    location: { lat: number; lng: number },
    radius: number,
  ) {
    return this.habitableZonesEntityRepository
      .createQueryBuilder('hz')
      .where(
        'ST_DWithin(hz.area, ST_MakePoint(:lng, :lat)::geography, :distance)',
        {
          lng: location.lng,
          lat: location.lat,
          distance: radius,
        },
      )
      .getMany();
  }

  async isCoordinateInHabitableZone(
    longitude: number,
    latitude: number,
  ): Promise<boolean> {
    const result = await this.discoveredHabitableZonesEntityRepository
      .createQueryBuilder('dhz')
      .innerJoinAndSelect('dhz.habitableZone', 'hz')
      .where(
        'ST_Contains(hz.area, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))',
        { longitude, latitude },
      )
      .getOne();

    return !!result;
  }
}
