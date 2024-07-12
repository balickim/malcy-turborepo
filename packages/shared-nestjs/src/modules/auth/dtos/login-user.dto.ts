import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class LoginUserDto {
  @ApiProperty({
    example: "user@example.com",
    description: "The email of the user",
  })
  @IsString()
  @Length(3, 48)
  username: string;

  @ApiProperty({
    example: "password123",
    description: "The password of the user",
  })
  @IsString()
  @Length(8)
  password: string;
}
