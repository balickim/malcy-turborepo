import { IsString, IsObject, Length } from "class-validator";

export class CreateSettlementDto {
  @IsString()
  @Length(5, 100, { message: "The name needs to have at least 5 characters." })
  name: string;

  @IsObject()
  position: { lat: number; lng: number };
}
