import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArmyEntity, UsersEntity } from 'shared-nestjs';

import { ArmiesModule } from '~/modules/armies/armies.module';
import { CombatsController } from '~/modules/combats/combats.controller';
import { CombatsService } from '~/modules/combats/combats.service';
import { ConfigModule } from '~/modules/config/config.module';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';

@Module({
  controllers: [CombatsController],
  imports: [
    TypeOrmModule.forFeature([ArmyEntity, UsersEntity]),
    ConfigModule,
    forwardRef(() => SettlementsModule),
    forwardRef(() => ArmiesModule),
    forwardRef(() => FogOfWarModule),
    UserLocationModule,
  ],
  providers: [CombatsService],
  exports: [CombatsService],
})
export class CombatsModule {}
