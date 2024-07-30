import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import Redis, { RedisKey } from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { WorldConfigDto } from 'shared-nestjs/dist/modules/config';
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
    await this.validateConfig(gameConfig);
    await this.setConfig(gameConfig);
  }

  private async retrieveGameConfig(): Promise<WorldConfig> {
    const apiKey = this.appConfig.get().BACKOFFICE_API_KEY;
    const response = await firstValueFrom(
      this.httpService.get<{ data: WorldConfig }>(
        this.appConfig.get().BACKOFFICE_HOST +
          '/config/' +
          this.appConfig.get().WORLD_NAME,
        {
          headers: {
            'x-api-key': apiKey,
          },
        },
      ),
    );
    return response?.data.data;
  }

  private async validateConfig(config: WorldConfig) {
    const instance = plainToInstance(WorldConfigDto, config);
    try {
      await validateOrReject(instance);
    } catch (errors) {
      if (errors instanceof Array) {
        for (const error of errors) {
          this.logValidationErrors(error);
        }
      }
      throw new Error('Validation failed');
    }
  }

  private logValidationErrors(error: ValidationError, prefix = '') {
    if (error.children && error.children.length > 0) {
      for (const child of error.children) {
        this.logValidationErrors(child, `${prefix}${error.property}.`);
      }
    } else {
      this.logger.error(
        `${prefix}${error.property} has failed constraints: ${Object.keys(
          error.constraints,
        ).join(', ')}`,
      );
      if (error.constraints) {
        for (const key in error.constraints) {
          this.logger.error(`${key}: ${error.constraints[key]}`);
        }
      }
    }
  }

  private async setConfig(worldConfig: WorldConfig) {
    return this.redis.set(this.WORLD_CONFIG_KEY, JSON.stringify(worldConfig));
  }

  public async gameConfig(): Promise<WorldConfig> {
    return JSON.parse(await this.redis.get(this.WORLD_CONFIG_KEY));
  }
}
