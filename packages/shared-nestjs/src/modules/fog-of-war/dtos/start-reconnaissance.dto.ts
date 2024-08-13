import { IsObject, IsNumber, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer";
import { UnitType } from "shared-types";

class Coordinates {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class StartReconnaissanceDto {
  @IsObject()
  @ValidateNested()
  @Type(() => Coordinates)
  finish: Coordinates;

  @Min(0)
  [UnitType.ARCHER]: number;
}
