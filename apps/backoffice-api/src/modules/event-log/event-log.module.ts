import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLogEntity } from 'shared-nestjs';

import { EventLogSubscriber } from '~/modules/event-log/event-log.subscriber';

import { EventLogService } from './event-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventLogEntity])],
  providers: [EventLogService, EventLogSubscriber],
  exports: [EventLogService],
})
export class EventLogModule {}
