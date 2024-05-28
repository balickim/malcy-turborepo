import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '~/modules/config/config.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake?.auth?.token;

    if (!token) {
      return false;
    }

    try {
      client.user = this.jwtService.verify(token, {
        secret: this.configService.appConfig.JWT_SECRET,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
