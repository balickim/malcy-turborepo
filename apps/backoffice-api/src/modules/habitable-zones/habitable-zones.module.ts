import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BackofficeHabitableZonesEntity,
  WorldsConfigEntity,
} from 'shared-nestjs';

import { HabitableZonesController } from '~/modules/habitable-zones/habitable-zones.controller';
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';
import { GetFromOverpass } from '~/modules/habitable-zones/use-cases/get-from-overpass';
import { WorldsConfigModule } from '~/modules/worlds-config/worlds-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BackofficeHabitableZonesEntity,
      WorldsConfigEntity,
    ]),
    WorldsConfigModule,
    HttpModule,
  ],
  controllers: [HabitableZonesController],
  providers: [HabitableZonesService, GetFromOverpass],
  exports: [],
})
export class HabitableZonesModule {}
