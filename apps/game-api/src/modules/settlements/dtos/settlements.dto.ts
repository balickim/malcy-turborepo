import { ArmyEntity, SettlementTypesEnum } from 'shared-nestjs';
import { GeoJSON } from 'typeorm';

import { TBasicUser } from '~/modules/users/types/users.types';

export class PublicSettlementDto {
  id: string;
  name: string;
  location: GeoJSON;
  type: SettlementTypesEnum;
  user: TBasicUser;
}

export class PublicSettlementDtoWithConvertedLocation {
  id: string;
  name: string;
  type: SettlementTypesEnum;
  user: TBasicUser;
  lat: number;
  lng: number;
  siege: unknown;
}

export class PrivateSettlementDto extends PublicSettlementDto {
  gold: number;
  wood: number;
  army: ArmyEntity;
}
