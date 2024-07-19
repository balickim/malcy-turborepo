import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementsEntity } from 'shared-nestjs';

import { ConfigModule } from '~/modules/config/config.module';
import { ResourcesService } from '~/modules/resources/resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([SettlementsEntity]), ConfigModule],
  providers: [ResourcesService],
})
export class ResourcesModule {}
