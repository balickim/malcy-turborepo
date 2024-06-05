import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { AccessTokenPayload } from '~/modules/auth/types/AccessTokenPayload';
import { AppConfig } from '~/modules/config/appConfig';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: AppConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.appConfig.JWT_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload) {
    return payload;
  }
}
