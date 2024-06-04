import { GeoJSON } from "leaflet";

import { TArmy, UnitType } from "~/types/army";

export enum SettlementTypesEnum {
  MINING_TOWN = "MINING_TOWN",
  CASTLE_TOWN = "CASTLE_TOWN",
  FORTIFIED_SETTLEMENT = "FORTIFIED_SETTLEMENT",
  CAPITOL_SETTLEMENT = "CAPITOL_SETTLEMENT",
}

export type TBasicUser = { id: string; username: string };

export interface IPublicSettlementDto {
  id: string;
  name: string;
  location: GeoJSON;
  type: SettlementTypesEnum;
  user: TBasicUser;
}

export interface IPublicSettlementDtoWithConvertedLocation
  extends IPublicSettlementDto {
  lat: number;
  lng: number;
}

export interface IPrivateSettlementDto extends IPublicSettlementDto {
  gold: number;
  wood: number;
  army: TArmy;
}

export interface IStartSiegeDto {
  army: Partial<TArmy>;
}

export interface ISettlementDto {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: SettlementTypesEnum;
  user: {
    createdAt: string;
    deletedAt: string | null;
    email: string;
    id: string;
    nick: string;
    updatedAt: string;
  };
  army: TArmy;
  siege?: {
    jobId: string;
    data: IStartSiegeDto;
    remainingDelay: number;
    progress: number;
  };
}

export interface ISettlementDetailsDto {
  [UnitType.SWORDSMAN]: number;
  [UnitType.ARCHER]: number;
  [UnitType.KNIGHT]: number;
  [UnitType.LUCHADOR]: number;
  [UnitType.ARCHMAGE]: number;
}

export interface IRequestPickUpArmyDto {
  settlementId?: string;
  [UnitType.SWORDSMAN]: number;
  [UnitType.ARCHER]: number;
  [UnitType.KNIGHT]: number;
  [UnitType.LUCHADOR]: number;
  [UnitType.ARCHMAGE]: number;
}

export interface IRequestPutDownArmyDto {
  settlementId?: string;
  [UnitType.SWORDSMAN]: number;
  [UnitType.ARCHER]: number;
  [UnitType.KNIGHT]: number;
  [UnitType.LUCHADOR]: number;
  [UnitType.ARCHMAGE]: number;
}
