import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

import { AuthService } from '~/modules/auth/auth.service';
import { UsersService } from '~/modules/users/users.service';

export interface IExpressRequestWithUser<T> extends ExpressRequest {
  user: T;
}

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    const user = await this.authService.validateUserById(payload.id);

    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    this.usersService.setActionTimestamp(user);
    request.user = user;
    return true;
  }
}
