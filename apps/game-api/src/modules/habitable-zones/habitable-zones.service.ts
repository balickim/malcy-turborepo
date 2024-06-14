import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { AppConfig } from '~/modules/config/appConfig';
import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';

@Injectable()
export class HabitableZonesService implements OnModuleInit {
  private readonly logger = new Logger(HabitableZonesService.name);

  constructor(
    @InjectRepository(HabitableZonesEntity)
    private habitableZonesEntityRepository: Repository<HabitableZonesEntity>,
    private readonly httpService: HttpService,
    private appConfig: AppConfig,
  ) {}

  async onModuleInit() {
    const habitableZones = await this.retrieveHabitableZones();
    await this.saveDownloadedHabitableZones(habitableZones);
  }

  private async saveDownloadedHabitableZones(habitableZones: any) {
    await this.habitableZonesEntityRepository.upsert(habitableZones, ['id']);
    this.logger.log('loading habitable zones FINISHED');
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
}
