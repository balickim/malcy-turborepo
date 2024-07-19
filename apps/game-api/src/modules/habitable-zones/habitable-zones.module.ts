import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DiscoveredHabitableZonesEntity,
  HabitableZonesEntity,
} from 'shared-nestjs';

import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';

import { AppConfig } from '../config/appConfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HabitableZonesEntity,
      DiscoveredHabitableZonesEntity,
    ]),
    HttpModule,
  ],
  providers: [AppConfig, HabitableZonesService],
  exports: [HabitableZonesService],
})
export class HabitableZonesModule {}
