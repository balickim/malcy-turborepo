import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';

import { AuthService } from '~/modules/auth/auth.service';

export interface IExpressRequestWithUser<T> extends ExpressRequest {
  user: T;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<IExpressRequestWithUser<any>>();
    const sessionId = request.cookies['session_id'];

    if (!sessionId) {
      throw new UnauthorizedException('No session ID provided');
    }

    const user = await this.authService.getUserFromSession(sessionId);
    if (!user) {
      throw new UnauthorizedException('Invalid session ID');
    }

    request.user = { id: user.userId, username: user.username };

    return true;
  }
}
