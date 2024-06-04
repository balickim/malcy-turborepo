import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '~/modules/config/config.module';
import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UsersController } from '~/modules/users/users.controller';
import { UsersService } from '~/modules/users/users.service';
import { UsersSubscriber } from '~/modules/users/users.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), ConfigModule],
  providers: [UsersService, UsersSubscriber],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
