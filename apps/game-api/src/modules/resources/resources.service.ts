import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SettlementsEntity } from 'shared-nestjs';
import {
  WorldConfig,
  ResourceTypeEnum,
  SharedSettlementTypesEnum,
} from 'shared-types';
import { Repository } from 'typeorm';

import { ConfigService } from '~/modules/config/config.service';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
    private configService: ConfigService,
  ) {}

  getBaseValue(
    settlementType: SharedSettlementTypesEnum,
    resourceType: ResourceTypeEnum,
    worldConfig: WorldConfig,
  ) {
    return worldConfig.SETTLEMENT[settlementType].RESOURCE_GENERATION_BASE[
      resourceType
    ];
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateResources() {
    const worldConfig = await this.configService.worldConfig();

    const resources = ['gold', 'wood', 'iron'];
    const settlementTypes = [
      SharedSettlementTypesEnum.MINING_TOWN,
      SharedSettlementTypesEnum.CASTLE_TOWN,
      SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT,
      SharedSettlementTypesEnum.CAPITOL_SETTLEMENT,
    ];

    const resourceValues = { gold: {}, wood: {}, iron: {} };
    const maxResources = { gold: {}, wood: {}, iron: {} };

    for (const resource of resources) {
      resourceValues[resource] = {};
      maxResources[resource] = {};
      for (const type of settlementTypes) {
        resourceValues[resource][type] = this.getBaseValue(
          type,
          resource as ResourceTypeEnum,
          worldConfig,
        );
        maxResources[resource][type] =
          worldConfig.SETTLEMENT[type].RESOURCES_CAP[resource];
      }
    }

    const query = this.settlementsEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE
        WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${resourceValues.gold[SharedSettlementTypesEnum.MINING_TOWN]} * "resourcesMultiplicator", ${maxResources.gold[SharedSettlementTypesEnum.MINING_TOWN]})
        WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${resourceValues.gold[SharedSettlementTypesEnum.CASTLE_TOWN]} * "resourcesMultiplicator", ${maxResources.gold[SharedSettlementTypesEnum.CASTLE_TOWN]})
        WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${resourceValues.gold[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]} * "resourcesMultiplicator", ${maxResources.gold[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]})
        WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${resourceValues.gold[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]} * "resourcesMultiplicator", ${maxResources.gold[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]})
        ELSE "gold"
      END`,
        wood: () => `CASE
        WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${resourceValues.wood[SharedSettlementTypesEnum.MINING_TOWN]} * "resourcesMultiplicator", ${maxResources.wood[SharedSettlementTypesEnum.MINING_TOWN]})
        WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${resourceValues.wood[SharedSettlementTypesEnum.CASTLE_TOWN]} * "resourcesMultiplicator", ${maxResources.wood[SharedSettlementTypesEnum.CASTLE_TOWN]})
        WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${resourceValues.wood[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]} * "resourcesMultiplicator", ${maxResources.wood[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]})
        WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${resourceValues.wood[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]} * "resourcesMultiplicator", ${maxResources.wood[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]})
        ELSE "wood"
      END`,
        iron: () => `CASE
        WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' AND "isBesieged" = FALSE THEN LEAST("iron" + ${resourceValues.iron[SharedSettlementTypesEnum.MINING_TOWN]} * "resourcesMultiplicator", ${maxResources.iron[SharedSettlementTypesEnum.MINING_TOWN]})
        WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' AND "isBesieged" = FALSE THEN LEAST("iron" + ${resourceValues.iron[SharedSettlementTypesEnum.CASTLE_TOWN]} * "resourcesMultiplicator", ${maxResources.iron[SharedSettlementTypesEnum.CASTLE_TOWN]})
        WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("iron" + ${resourceValues.iron[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]} * "resourcesMultiplicator", ${maxResources.iron[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]})
        WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("iron" + ${resourceValues.iron[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]} * "resourcesMultiplicator", ${maxResources.iron[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]})
        ELSE "iron"
      END`,
      })
      .getQuery();

    await this.settlementsEntityRepository.query(query);

    this.logger.debug('Distributing resources to settlements FINISHED');
  }
}
