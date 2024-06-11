import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis, { RedisKey } from 'ioredis';
import { catchError, firstValueFrom } from 'rxjs';
import { WorldConfig } from 'shared-types';

import { AppConfig } from '~/modules/config/appConfig';

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly logger = new Logger(ConfigService.name);
  public readonly WORLD_CONFIG_KEY: RedisKey;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private appConfig: AppConfig,
    private readonly httpService: HttpService,
  ) {
    this.WORLD_CONFIG_KEY = `world_config_${this.appConfig.get().WORLD_NAME}`;
  }

  async onModuleInit() {
    const gameConfig = await this.retrieveGameConfig();
    await this.setConfig(gameConfig);
  }

  private async retrieveGameConfig(): Promise<WorldConfig> {
    const apiKey = this.appConfig.get().BACKOFFICE_API_KEY;
    const { data } = await firstValueFrom(
      this.httpService
        .get<{ data: WorldConfig }>(
          this.appConfig.get().BACKOFFICE_HOST +
            '/config/' +
            this.appConfig.get().WORLD_NAME,
          {
            headers: {
              'x-api-key': apiKey,
            },
          },
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data.data;
  }

  private async setConfig(worldConfig: WorldConfig) {
    return this.redis.set(this.WORLD_CONFIG_KEY, JSON.stringify(worldConfig));
  }

  public async gameConfig(): Promise<WorldConfig> {
    return JSON.parse(await this.redis.get(this.WORLD_CONFIG_KEY));
  }
}
