import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { UnitType } from 'shared-types';

@Injectable()
export class ArmiesService {
  constructor(
    @InjectRepository(ArmyEntity)
    private armyEntityRepository: Repository<ArmyEntity>,
  ) {}

  public areTroopsAvailable(
    providedArmy: Record<UnitType, number>,
    requiredArmy: Record<UnitType, number>,
  ) {
    for (const unitType in requiredArmy) {
      if (
        providedArmy[unitType as UnitType] < requiredArmy[unitType as UnitType]
      ) {
        return false;
      }
    }
    return true;
  }

  public deductUnits(
    army: Record<UnitType, number>,
    unitsToDeduct: Record<UnitType, number>,
  ): Record<UnitType, number> {
    for (const unitType in unitsToDeduct) {
      army[unitType as UnitType] -= unitsToDeduct[unitType as UnitType];
    }
    return { ...army };
  }

  public addUnits(
    army: Record<UnitType, number>,
    unitsToAdd: Record<UnitType, number>,
  ): Record<UnitType, number> {
    for (const unitType in unitsToAdd) {
      army[unitType as UnitType] += unitsToAdd[unitType as UnitType];
    }
    return { ...army };
  }

  public async saveArmy(army: ArmyEntity) {
    await this.armyEntityRepository.save(army);
  }
}
