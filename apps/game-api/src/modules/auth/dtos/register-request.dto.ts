import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
