import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { UnitType } from 'shared-types';

@Injectable()
export class ArmyRepository extends Repository<ArmyEntity> {
  constructor(
    @InjectRepository(ArmyEntity)
    private readonly armyRepo: Repository<ArmyEntity>,
  ) {
    super(armyRepo.target, armyRepo.manager, armyRepo.queryRunner);
  }

  async resetUnits(armyId: string): Promise<void> {
    await this.update(armyId, {
      [UnitType.SWORDSMAN]: 0,
      [UnitType.ARCHER]: 0,
      [UnitType.KNIGHT]: 0,
      [UnitType.LUCHADOR]: 0,
      [UnitType.ARCHMAGE]: 0,
    });
  }
}
