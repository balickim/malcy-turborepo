import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export interface IJwtUser {
  id: string;
  username: string;
  iat: number;
  exp: number;
  _IsNear?: boolean;
}
