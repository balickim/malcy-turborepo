import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArmyEntity, EventLogEntity, SettlementsEntity } from 'shared-nestjs';

import { ArmiesModule } from '~/modules/armies/armies.module';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { HabitableZonesModule } from '~/modules/habitable-zones/habitable-zones.module';
import { PushNotificationsModule } from '~/modules/push-notifications/push-notifications.module';
import { RecruitmentsController } from '~/modules/recruitments/recruitments.controller';
import { RecruitmentsService } from '~/modules/recruitments/recruitments.service';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArmyEntity, SettlementsEntity, EventLogEntity]),
    ConfigModule,
    UsersModule,
    forwardRef(() => FogOfWarModule),
    forwardRef(() => ArmiesModule),
    HabitableZonesModule,
    PushNotificationsModule,
  ],
  controllers: [RecruitmentsController],
  providers: [
    RecruitmentsService,
    SettlementsService,
    UserLocationService,
    EventLogService,
  ],
})
export class RecruitmentsModule {}
