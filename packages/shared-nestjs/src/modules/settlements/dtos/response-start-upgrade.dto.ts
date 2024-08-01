import { IResource } from "shared-types";
import { SettlementTypesEnum } from "../entities";

export class ResponseStartUpgradeDto {
  settlementId: string;
  finishesOn: Date;
  lockedResources: IResource;
  settlementUpgradeTime: number;
  nextSettlementType: SettlementTypesEnum;
}
