import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { cleanEnv, num, port, str } from 'envalid';

config();

@Injectable()
export class AppConfig {
  private readonly _appConfig = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'] }),

    API_KEY: str(),
    PORT: port({ devDefault: 8080 }),

    FE_APP_HOST: str({ devDefault: 'http://localhost:5173' }),

    BACKOFFICE_DB_HOST: str(),
    BACKOFFICE_DB_PORT: num(),
    BACKOFFICE_DB_DATABASE: str(),
    BACKOFFICE_DB_USERNAME: str(),
    BACKOFFICE_DB_PASSWORD: str(),
  });

  public get() {
    return this._appConfig;
  }
}
