import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';

import { AuthService } from '~/modules/auth/auth.service';
import { Public } from '~/modules/auth/decorators/public.decorator';
import { RegisterRequestDto } from '~/modules/auth/dtos/register-request.dto';
import { RegisterResponseDTO } from '~/modules/auth/dtos/register-response.dto';
import {
  IExpressRequestWithUser,
  RefreshTokenGuard,
} from '~/modules/auth/guards/jwt.guard';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: IExpressRequestWithUser<UsersEntity>,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokenResponse = await this.authService.login(req.user);

    res.cookie('refresh_token', tokenResponse.refresh_token, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    delete req.user.password;

    return { access_token: tokenResponse.access_token, user: req.user };
  }

  @Post('register')
  async register(
    @Body() registerBody: RegisterRequestDto,
  ): Promise<RegisterResponseDTO | BadRequestException> {
    return await this.authService.register(registerBody);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: IExpressRequestWithUser<UsersEntity>,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const user = req.user;
    const tokenResponse = await this.authService.refreshToken(user);
    res.cookie('refresh_token', tokenResponse.refresh_token, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokenResponse.access_token, user };
  }
}
