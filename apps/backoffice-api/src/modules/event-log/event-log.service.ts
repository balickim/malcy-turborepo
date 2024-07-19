import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventLogEntity } from 'shared-nestjs';
import { Repository } from 'typeorm';

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
