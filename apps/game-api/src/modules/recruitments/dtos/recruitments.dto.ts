import { IResource, UnitType } from 'shared-types';

export class RequestRecruitmentDto {
  settlementId: string;
  unitCount: number;
  unitType: UnitType;
}

export class ResponseRecruitmentDto {
  settlementId: string;
  unitCount: number;
  unitType: UnitType;
  unitRecruitmentTime: number;
  finishesOn: Date;
  lockedResources: IResource;
}
