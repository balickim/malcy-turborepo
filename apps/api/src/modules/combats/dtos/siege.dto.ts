import { UnitType } from 'shared-types';

export class StartSiegeDto {
  army: Record<UnitType, number>;
}
