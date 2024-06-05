import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';

import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfig],
      useFactory: async (
        configService: AppConfig,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            host: configService.appConfig.REDIS_HOST,
            port: configService.appConfig.REDIS_PORT,
            password: configService.appConfig.REDIS_PASSWORD,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
  ],
})
export class CacheRedisProviderModule {}
