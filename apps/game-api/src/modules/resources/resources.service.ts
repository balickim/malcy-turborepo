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
    const gameConfig = await this.configService.gameConfig();

    const goldMiningTown = this.getBaseValue(
      SharedSettlementTypesEnum.MINING_TOWN,
      ResourceTypeEnum.gold,
      gameConfig,
    );
    const goldCastleTown = this.getBaseValue(
      SharedSettlementTypesEnum.CASTLE_TOWN,
      ResourceTypeEnum.gold,
      gameConfig,
    );
    const goldFortifiedSettlement = this.getBaseValue(
      SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT,
      ResourceTypeEnum.gold,
      gameConfig,
    );
    const goldCapitolSettlement = this.getBaseValue(
      SharedSettlementTypesEnum.CAPITOL_SETTLEMENT,
      ResourceTypeEnum.gold,
      gameConfig,
    );

    const woodMiningTown = this.getBaseValue(
      SharedSettlementTypesEnum.MINING_TOWN,
      ResourceTypeEnum.wood,
      gameConfig,
    );
    const woodCastleTown = this.getBaseValue(
      SharedSettlementTypesEnum.CASTLE_TOWN,
      ResourceTypeEnum.wood,
      gameConfig,
    );
    const woodFortifiedSettlement = this.getBaseValue(
      SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT,
      ResourceTypeEnum.wood,
      gameConfig,
    );
    const woodCapitolSettlement = this.getBaseValue(
      SharedSettlementTypesEnum.CAPITOL_SETTLEMENT,
      ResourceTypeEnum.wood,
      gameConfig,
    );

    const maxGoldMiningTown =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCastleTown =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldFortifiedSettlement =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCapitolSettlement =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.gold];

    const maxWoodMiningTown =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCastleTown =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodFortifiedSettlement =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCapitolSettlement =
      gameConfig.SETTLEMENT[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.wood];

    const query = this.settlementsEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE
          WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${goldMiningTown} * "resourcesMultiplicator", ${maxGoldMiningTown})
          WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${goldCastleTown} * "resourcesMultiplicator", ${maxGoldCastleTown})
          WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${goldFortifiedSettlement} * "resourcesMultiplicator", ${maxGoldFortifiedSettlement})
          WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("gold" + ${goldCapitolSettlement} * "resourcesMultiplicator", ${maxGoldCapitolSettlement})
          ELSE "gold"
        END`,
        wood: () => `CASE
          WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${woodMiningTown} * "resourcesMultiplicator", ${maxWoodMiningTown})
          WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${woodCastleTown} * "resourcesMultiplicator", ${maxWoodCastleTown})
          WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${woodFortifiedSettlement} * "resourcesMultiplicator", ${maxWoodFortifiedSettlement})
          WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' AND "isBesieged" = FALSE THEN LEAST("wood" + ${woodCapitolSettlement} * "resourcesMultiplicator", ${maxWoodCapitolSettlement})
          ELSE "wood"
        END`,
      })
      .getQuery();

    await this.settlementsEntityRepository.query(query);

    this.logger.debug('Distributing resources to settlements FINISHED');
  }
}
