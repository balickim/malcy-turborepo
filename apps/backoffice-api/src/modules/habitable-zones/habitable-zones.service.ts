import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';

@Injectable()
export class HabitableZonesService {
  private readonly logger = new Logger(HabitableZonesService.name);

  constructor(
    @InjectRepository(HabitableZonesEntity)
    private habitableZonesEntityRepository: Repository<HabitableZonesEntity>,
  ) {}

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
