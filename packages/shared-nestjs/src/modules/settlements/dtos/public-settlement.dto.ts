import { GeoJSON } from "typeorm";
import { SettlementTypesEnum } from "../entities";
import { TBasicUser } from "../../users";

export class PublicSettlementDto {
  id: string;
  name: string;
  location: GeoJSON;
  type: SettlementTypesEnum;
  user: TBasicUser;
}
