import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { bool, cleanEnv, num, port, str } from 'envalid';

config();

@Injectable()
export class AppConfig {
  private readonly _appConfig = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'] }),

    BACKOFFICE_HOST: str(),
    BACKOFFICE_API_KEY: str(),

    FE_APP_HOST: str({ devDefault: 'http://localhost:5173' }),

    PORT: port({ devDefault: 8090 }),
    WORLD_NAME: str(),

    JWT_SECRET: str({ devDefault: 'secret' }),
    JWT_ACCESS_TOKEN_EXPIRES_IN: str({ devDefault: '1h' }),
    JWT_REFRESH_TOKEN_EXPIRES_IN: str({ devDefault: '31d' }),

    GAME_DB_HOST: str(),
    GAME_DB_PORT: num(),
    GAME_DB_DATABASE: str(),
    GAME_DB_USERNAME: str(),
    GAME_DB_PASSWORD: str(),
    GAME_DB_SYNCHRONIZE: bool({ default: false, devDefault: true }),

    GAME_REDIS_HOST: str(),
    GAME_REDIS_PORT: num(),
    GAME_REDIS_PASSWORD: str({ default: 'password' }),
  });

  public get() {
    return this._appConfig;
  }
}
