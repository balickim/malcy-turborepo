import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDTOResponseWorldsList } from 'shared-types';
import { Repository } from 'typeorm';

import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';

@Injectable()
export class WorldsConfigService {
  constructor(
    @InjectRepository(WorldsConfigEntity)
    private readonly worldsConfigEntityRepository: Repository<WorldsConfigEntity>,
  ) {}

  public async getWorldsList(): Promise<IDTOResponseWorldsList[]> {
    return this.worldsConfigEntityRepository.find({
      select: ['id', 'name'],
    });
  }

  public async getWorldIdByName(name: string) {
    const data = await this.worldsConfigEntityRepository.findOne({
      select: ['id'],
      where: { name },
    });

    return data.id;
  }
}
