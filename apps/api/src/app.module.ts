import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { checkPostGISExtension } from '~/common/utils/postgis';
import { ArmiesModule } from '~/modules/armies/armies.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { ChatModule } from '~/modules/chat/chat.module';
import { CombatsModule } from '~/modules/combats/combats.module';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { RecruitmentsModule } from '~/modules/recruitments/recruitments.module';
import { ResourcesModule } from '~/modules/resources/resources.module';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';
import { UsersModule } from '~/modules/users/users.module';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';
import { PostgresDatabaseProviderModule } from '~/providers/database/postgres/provider.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    PostgresDatabaseProviderModule,
    CacheRedisProviderModule,
    UsersModule,
    SettlementsModule,
    AuthModule,
    ArmiesModule,
    UserLocationModule,
    RecruitmentsModule,
    ResourcesModule,
    EventLogModule,
    ChatModule,
    FogOfWarModule,
    CombatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
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
