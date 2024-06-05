import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';

import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfig],
      useFactory: async (appConfig: AppConfig): Promise<RedisModuleOptions> => {
        return {
          config: {
            host: appConfig.get().REDIS_HOST,
            port: appConfig.get().REDIS_PORT,
            password: appConfig.get().REDIS_PASSWORD,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
  ],
})
export class CacheRedisProviderModule {}
