import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';
import { HabitableZonesController } from '~/modules/habitable-zones/habitable-zones.controller';
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';
import { WorldsConfigModule } from '~/modules/worlds-config/worlds-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitableZonesEntity]),
    WorldsConfigModule,
  ],
  controllers: [HabitableZonesController],
  providers: [HabitableZonesService],
  exports: [HabitableZonesService],
})
export class HabitableZonesModule {}
