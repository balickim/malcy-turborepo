import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";
import { LoginUserDto } from "./login-user.dto";

export class RegisterUserDto extends LoginUserDto {
  @ApiProperty()
  @IsString()
  @Length(3, 48)
  username: string;
}
