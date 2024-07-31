import {
  IsString,
  IsEnum,
  IsObject,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";
import { UnitType } from "shared-types";

export const SiegeTypes = {
  DESTRUCTION: "destruction",
  TAKE_OVER: "take-over",
} as const;
export type SiegeType = (typeof SiegeTypes)[keyof typeof SiegeTypes];

function IsValidArmy(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsValidArmy",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          return Object.values(value).every(
            (v) => typeof v === "number" && Number.isInteger(v) && v >= 0
          );
        },
        defaultMessage(args: ValidationArguments) {
          return "Each unit count must be an integer 0 or greater.";
        },
      },
    });
  };
}

export class StartSiegeDto {
  @IsString()
  settlementId: string;

  @IsEnum(SiegeTypes, {
    message: "Invalid siege type. Must be one of the predefined siege types.",
  })
  siegeType: SiegeType;

  @IsObject()
  @IsValidArmy({
    message: "Each unit count must be an integer 0 or greater.",
  })
  army: Record<UnitType, number>;
}
