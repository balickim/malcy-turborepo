import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @Length(3, 48)
  username: string;

  @ApiProperty()
  @IsEmail()
  @Length(3, 48)
  email: string;

  @ApiProperty()
  @IsString()
  // @MinLength(8, {
  //   message: "Password must be at least 8 characters long",
  // })
  // @Matches(/(?=.*[a-z])/, {
  //   message: "Password must contain at least one lowercase letter",
  // })
  // @Matches(/(?=.*[A-Z])/, {
  //   message: "Password must contain at least one uppercase letter",
  // })
  // @Matches(/(?=.*\d)/, {
  //   message: "Password must contain at least one number",
  // })
  // @Matches(/(?=.*[@$!%*?&])/, {
  //   message: "Password must contain at least one special character",
  // })
  password: string;
}
