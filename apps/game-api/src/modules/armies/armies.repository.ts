import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArmyEntity } from 'shared-nestjs';
import { UnitType } from 'shared-types';
import { Repository } from 'typeorm';

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
