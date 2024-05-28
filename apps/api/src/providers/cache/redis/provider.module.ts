import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';

import { ConfigModule } from '~/modules/config/config.module';
import { ConfigService } from '~/modules/config/config.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
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
