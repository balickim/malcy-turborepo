import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '~/modules/auth/auth.controller';
import { AuthService } from '~/modules/auth/auth.service';
import { JwtStrategy } from '~/modules/auth/strategy/jwt.strategy';
import { LocalStrategy } from '~/modules/auth/strategy/local.strategy';
import { AppConfig } from '~/modules/config/appConfig';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    EventLogModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: AppConfig) => ({
        secret: configService.appConfig.JWT_SECRET,
        signOptions: {
          expiresIn: parseInt(
            configService.appConfig.JWT_ACCESS_TOKEN_EXPIRES_IN,
          ),
        },
      }),
      inject: [AppConfig],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
