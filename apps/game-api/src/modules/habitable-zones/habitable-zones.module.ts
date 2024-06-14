import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';
import { HabitableZonesController } from '~/modules/habitable-zones/habitable-zones.controller';
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';

import { AppConfig } from '../config/appConfig';

@Module({
  imports: [TypeOrmModule.forFeature([HabitableZonesEntity]), HttpModule],
  controllers: [HabitableZonesController],
  providers: [AppConfig, HabitableZonesService],
  exports: [HabitableZonesService],
})
export class HabitableZonesModule {}
