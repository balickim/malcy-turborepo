import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { RegisterUserDto, UsersEntity } from 'shared-nestjs';

import { AuthService } from '~/modules/auth/auth.service';
import { Public } from '~/modules/auth/decorators/public.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: IExpressRequestWithUser<UsersEntity>,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const user = req.user;
    const session_id = await this.authService.createSession(user);

    res.cookie('session_id', session_id, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    delete user.password;

    // TODO fix that: Sending session_id here is a workaround for mobile, where the credentials are not correctly added in the handshake object
    return { user, session_id };
  }

  @Public()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<string> {
    return this.authService.registerUser(registerUserDto);
  }

  @Get('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const userId = req.user?.id;

    if (userId) {
      await this.authService.invalidateSession(userId);
    }

    res.cookie('session_id', '', {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'strict',
      expires: new Date(0),
    });

    return 'success';
  }
}
