import { SettlementTypesEnum } from 'shared-nestjs';
import { TBasicUser } from 'shared-nestjs/dist/modules/users/types/users.types';

export class PublicSettlementDtoWithConvertedLocation {
  id: string;
  name: string;
  type: SettlementTypesEnum;
  user: TBasicUser;
  lat: number;
  lng: number;
  siege: unknown;
}
