import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { bool, cleanEnv, num, port, str } from 'envalid';

config();

@Injectable()
export class AppConfig {
  private readonly _appConfig = cleanEnv(process.env, {
    API_KEY: str(),
    PORT: port({ devDefault: 8080 }),

    FE_APP_HOST: str({ devDefault: 'http://localhost:5173' }),

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
}
