import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyRepository } from '~/modules/armies/armies.repository';
import { ArmiesService } from '~/modules/armies/armies.service';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity])],
  providers: [ArmiesService, ArmyRepository],
  exports: [ArmiesService, ArmyRepository],
})
export class ArmiesModule {}
