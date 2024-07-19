import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArmyEntity } from 'shared-nestjs';

import { ArmyRepository } from '~/modules/armies/armies.repository';
import { ArmiesService } from '~/modules/armies/armies.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity])],
  providers: [ArmiesService, ArmyRepository],
  exports: [ArmiesService, ArmyRepository],
})
export class ArmiesModule {}
