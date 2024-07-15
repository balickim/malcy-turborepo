import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';
import { ISessionUser } from '~/modules/users/dtos/users.dto';
import { UsersService } from '~/modules/users/users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  async getMe(@Request() req: IExpressRequestWithUser<ISessionUser>) {
    return this.usersService.findOneUseByRelations(req.user.id, ['army']);
  }
}
