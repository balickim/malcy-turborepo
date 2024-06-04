import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';

@Injectable()
export class EventLogService {
  constructor(
    @InjectRepository(EventLogEntity)
    private eventLogEntityRepository: Repository<EventLogEntity>,
  ) {}

  async logEvent(data: Partial<EventLogEntity>): Promise<void> {
    const event = this.eventLogEntityRepository.create(data);
    await this.eventLogEntityRepository.save(event);
  }
}
