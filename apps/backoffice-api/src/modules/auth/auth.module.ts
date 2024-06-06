import { forwardRef, Module } from '@nestjs/common';

import { ApiKeyStrategy } from '~/modules/auth/strategy/apiKey.strategy';
import { ConfigModule } from '~/modules/config/config.module';

@Module({
  imports: [forwardRef(() => ConfigModule)],
  providers: [ApiKeyStrategy, ConfigModule],
  exports: [ApiKeyStrategy],
})
export class AuthModule {}
