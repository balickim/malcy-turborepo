import { IsString } from "class-validator";

export class UpgradeSettlementDto {
  @IsString()
  settlementId: string;
}
