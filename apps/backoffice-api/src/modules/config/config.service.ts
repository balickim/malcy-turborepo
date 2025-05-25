import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorldsConfigEntity } from 'shared-nestjs';
import { Repository } from 'typeorm';

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
