import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmiesModule } from '~/modules/armies/armies.module';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsController } from '~/modules/settlements/settlements.controller';
import { SettlementsGateway } from '~/modules/settlements/settlements.gateway';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { SettlementsSubscriber } from '~/modules/settlements/settlements.subscriber';
import { UserLocationModule } from '~/modules/user-location/user-location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettlementsEntity, ArmyEntity]),
    forwardRef(() => ArmiesModule),
    forwardRef(() => FogOfWarModule),
    ConfigModule,
    EventLogModule,
    forwardRef(() => UserLocationModule),
  ],
  controllers: [SettlementsController],
  providers: [SettlementsService, SettlementsGateway, SettlementsSubscriber],
  exports: [SettlementsService],
})
export class SettlementsModule {}
