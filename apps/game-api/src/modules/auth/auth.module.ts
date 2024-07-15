import { Module } from '@nestjs/common';

import { AuthController } from '~/modules/auth/auth.controller';
import { AuthService } from '~/modules/auth/auth.service';
import { LocalStrategy } from '~/modules/auth/strategy/local.strategy';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [UsersModule, EventLogModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
