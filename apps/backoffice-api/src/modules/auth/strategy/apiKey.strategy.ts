import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';

import { AppConfig } from '~/modules/config/appConfig';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private appConfig: AppConfig) {
    super({ header: 'x-api-key', prefix: '' }, true, async (apiKey, done) => {
      const isValid = this.validateApiKey(apiKey);
      if (!isValid) {
        return done(new UnauthorizedException(), false);
      }
      return done(null, true);
    });
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey === this.appConfig.get().API_KEY;
  }
}
