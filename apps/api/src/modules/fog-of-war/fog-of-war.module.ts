import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmiesModule } from '~/modules/armies/armies.module';
import { CombatsModule } from '~/modules/combats/combats.module';
import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { FogOfWarController } from '~/modules/fog-of-war/fog-of-war.controller';
import { FogOfWarService } from '~/modules/fog-of-war/fog-of-war.service';
import { DiscoveredHabitableZonesEntity } from '~/modules/habitable-zones/entities/discovered-habitable-zones.entity';
import { HabitableZonesModule } from '~/modules/habitable-zones/habitable-zones.module';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  controllers: [FogOfWarController],
  imports: [
    TypeOrmModule.forFeature([
      DiscoveredAreaEntity,
      VisibleAreaEntity,
      DiscoveredSettlementsEntity,
      DiscoveredHabitableZonesEntity,
    ]),
    CacheRedisProviderModule,
    forwardRef(() => ArmiesModule),
    forwardRef(() => SettlementsModule),
    forwardRef(() => CombatsModule),
    HabitableZonesModule,
  ],
  providers: [FogOfWarService],
  exports: [FogOfWarService],
})
export class FogOfWarModule {}
