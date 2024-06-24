import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(WorldsConfigEntity)
    private worldsConfigEntityRepository: Repository<WorldsConfigEntity>,
  ) {}

  public async getWorldsConfig(worldName: string) {
    const worldsConfigEntity = await this.worldsConfigEntityRepository.findOne({
      where: { name: worldName },
    });

    return worldsConfigEntity?.config;
  }
}
