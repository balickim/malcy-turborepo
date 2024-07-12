import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class LoginUserDto {
  @ApiProperty({
    example: "user@example.com",
    description: "The email of the user",
  })
  @IsEmail()
  @Length(3, 48)
  email: string;

  @ApiProperty({
    example: "password123",
    description: "The password of the user",
  })
  @IsString()
  @Length(8)
  password: string;
}
