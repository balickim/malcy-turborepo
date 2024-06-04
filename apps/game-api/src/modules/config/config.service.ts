import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { bool, cleanEnv, num, port, str } from 'envalid';

import { gameConfig } from './game.config';

config();

@Injectable()
export class ConfigService {
  private readonly _appConfig = cleanEnv(process.env, {
    FE_APP_HOST: str({ devDefault: 'http://localhost:5173' }),
    PORT: port({ devDefault: 8090 }),
    JWT_SECRET: str({ devDefault: 'secret' }),
    JWT_ACCESS_TOKEN_EXPIRES_IN: str({ devDefault: '1h' }),
    JWT_REFRESH_TOKEN_EXPIRES_IN: str({ devDefault: '31d' }),
    DB_HOST: str(),
    DB_PORT: num(),
    DB_DATABASE: str(),
    DB_USERNAME: str(),
    DB_PASSWORD: str(),
    DB_SYNCHRONIZE: bool({ default: false, devDefault: true }),
    REDIS_HOST: str(),
    REDIS_PORT: num(),
    REDIS_PASSWORD: str({ default: 'password' }),
  });

  get appConfig() {
    return this._appConfig;
  }

  get gameConfig() {
    return gameConfig();
  }
}
