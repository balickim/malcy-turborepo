import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeHabitableZonesEntity } from 'shared-nestjs';

import { HabitableZonesController } from '~/modules/habitable-zones/habitable-zones.controller';
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';
import { WorldsConfigModule } from '~/modules/worlds-config/worlds-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BackofficeHabitableZonesEntity]),
    WorldsConfigModule,
  ],
  controllers: [HabitableZonesController],
  providers: [HabitableZonesService],
  exports: [HabitableZonesService],
})
export class HabitableZonesModule {}
