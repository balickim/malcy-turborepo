import { IsString, IsObject } from "class-validator";

export class CreateSettlementDto {
  @IsString()
  name: string;

  @IsObject()
  position: { lat: number; lng: number };
}
