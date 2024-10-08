import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

import { checkPostGISExtension } from '~/common/utils/postgis';
import { AuthModule } from '~/modules/auth/auth.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { GameWorldBridgeModule } from '~/modules/game-world-bridge/game-world-bridge.module';
import { HabitableZonesModule } from '~/modules/habitable-zones/habitable-zones.module';
import { WorldsConfigModule } from '~/modules/worlds-config/worlds-config.module';
import { PostgresDatabaseProviderModule } from '~/providers/database/postgres/provider.module';

@Module({
  imports: [
    WorldsConfigModule,
    ScheduleModule.forRoot(),
    PostgresDatabaseProviderModule,
    EventLogModule,
    AuthModule,
    HabitableZonesModule,
    GameWorldBridgeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const hasPostGIS = await checkPostGISExtension(this.dataSource);
    if (!hasPostGIS) {
      this.logger.error('PostGIS extension is not available in the database.');
    } else {
      this.logger.log('PostGIS extension is available.');
    }
  }
}
