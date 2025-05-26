import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import {
  ActionType,
  ArmyEntity,
  CreateSettlementDto,
  PrivateSettlementDto,
  PublicSettlementDto,
  ResponseStartUpgradeDto,
  SettlementsEntity,
  SettlementTypesEnum,
  TransferArmyDto,
} from 'shared-nestjs';
import {
  IResource,
  ResourceTypeEnum,
  SharedSettlementTypesEnum,
  UnitType,
} from 'shared-types';
import { DataSource, Repository } from 'typeorm';

import { include, includeAll, sleep } from '~/common/utils';
import { convertGeoJSONToPoint } from '~/common/utils/postgis';
import { ArmiesService } from '~/modules/armies/armies.service';
import { ConfigService } from '~/modules/config/config.service';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

const bullSettlementUpgradeQueueName = (settlementId: string) =>
  `upgrade:settlement_${settlementId}`;
const settlementUpgradeProgressKey = (
  settlementId: string,
  nextType: SettlementTypesEnum,
  jobId: number | string,
) => `upgrade_progress:${settlementId}:${nextType}:${jobId}`;

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
    @InjectRepository(ArmyEntity)
    private armyEntityRepository: Repository<ArmyEntity>,
    private userLocationService: UserLocationService,
    private eventLogService: EventLogService,
    private configService: ConfigService,
    @Inject(forwardRef(() => ArmiesService))
    private armiesService: ArmiesService,
    private habitableZonesService: HabitableZonesService,
    private dataSource: DataSource,
  ) {}

  async createSettlement(
    createSettlementDto: CreateSettlementDto,
    user: ISessionUser,
  ) {
    const locationGeoJSON: GeoJSON.Point = {
      type: 'Point',
      coordinates: [
        createSettlementDto.position.lng,
        createSettlementDto.position.lat,
      ],
    };

    const isUserInHabitableZone =
      await this.habitableZonesService.isCoordinateInHabitableZone(
        createSettlementDto.position.lng,
        createSettlementDto.position.lat,
      );

    if (!isUserInHabitableZone) {
      throw new BadRequestException(
        'Settlements can only be created inside of a habitable zone',
      );
    }

    const isUserWithinRadius =
      await this.userLocationService.isUserWithinRadius({
        userId: user.id,
        location: convertGeoJSONToPoint(locationGeoJSON),
      });

    if (!isUserWithinRadius) {
      throw new BadRequestException('You are too far');
    }

    // const worldConfig = await this.configService.worldConfig();
    const nearbySettlements = await this.findWithinRadius(
      locationGeoJSON,
      5, // 5m - TODO create a config for it
    );

    if (nearbySettlements.length > 0) {
      throw new BadRequestException('A settlement already exists nearby');
    }

    const newSettlement = this.settlementsEntityRepository.create({
      name: createSettlementDto.name,
      location: locationGeoJSON,
      user,
    });

    try {
      const settlement =
        await this.settlementsEntityRepository.save(newSettlement);
      this.logger.log(`CREATED NEW SETTLEMENT WITH ID: ${settlement.id}`);
      this.eventLogService
        .logEvent({
          actionType: ActionType.settlementCreated,
          actionByUserId: user.id,
        })
        .catch((error) =>
          this.logger.error(`FAILED TO LOG EVENT --${error}--`),
        );
    } catch (error) {
      this.logger.log(`CREATED NEW SETTLEMENT FAILED: --${error}--`);
    }
  }

  async getPrivateSettlementById(id: string): Promise<PrivateSettlementDto> {
    const settlement: PrivateSettlementDto =
      await this.settlementsEntityRepository.findOne({
        select: includeAll(this.settlementsEntityRepository),
        where: { id },
        relations: ['user', 'army'],
      });

    if (!settlement)
      throw new NotFoundException(`Settlement not found with ID: ${id}`);

    return settlement;
  }

  async getPublicSettlementById(id: string): Promise<PublicSettlementDto> {
    const settlement = await this.settlementsEntityRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!settlement)
      throw new NotFoundException(`Settlement not found with ID: ${id}`);

    return settlement;
  }

  async getSettlementById(
    id: string,
    user: ISessionUser,
  ): Promise<PublicSettlementDto | PrivateSettlementDto> {
    const privateSettlement = await this.getPrivateSettlementById(id);
    if (privateSettlement.user.id === user.id) {
      return privateSettlement;
    }

    return this.toPublicSettlementDto(privateSettlement);
  }

  async transferArmy(
    transferArmyDto: TransferArmyDto,
    settlement: PrivateSettlementDto,
    isPickUp: boolean,
  ) {
    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    const sourceArmy = isPickUp ? settlement.army : userArmy;
    const targetArmy = isPickUp ? userArmy : settlement.army;

    const areTroopsAvailable = this.armiesService.areTroopsAvailable(
      sourceArmy,
      transferArmyDto,
    );
    if (!areTroopsAvailable) {
      throw new NotFoundException(
        isPickUp
          ? 'Not enough troops in the settlement'
          : 'Not enough troops in the user army',
      );
    }

    const updateArmy = (army: any, dto: TransferArmyDto, factor: number) => {
      return Object.keys(dto).reduce(
        (updatedArmy, unitType) => {
          if (unitType === 'settlementId') return updatedArmy;
          return {
            ...updatedArmy,
            [unitType]: army[unitType] + dto[unitType] * factor,
          };
        },
        { ...army },
      );
    };

    const updatedSourceArmy = updateArmy(sourceArmy, transferArmyDto, -1);
    const updatedTargetArmy = updateArmy(targetArmy, transferArmyDto, 1);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (isPickUp) {
        // Transferring from settlement to user
        await queryRunner.manager.update(
          this.armyEntityRepository.target,
          { settlementId: settlement.id },
          {
            [UnitType.SWORDSMAN]: updatedSourceArmy[UnitType.SWORDSMAN],
            [UnitType.ARCHER]: updatedSourceArmy[UnitType.ARCHER],
            [UnitType.KNIGHT]: updatedSourceArmy[UnitType.KNIGHT],
            [UnitType.LUCHADOR]: updatedSourceArmy[UnitType.LUCHADOR],
            [UnitType.ARCHMAGE]: updatedSourceArmy[UnitType.ARCHMAGE],
          },
        );
        await queryRunner.manager.update(
          this.armyEntityRepository.target,
          { userId: settlement.user.id },
          {
            [UnitType.SWORDSMAN]: updatedTargetArmy[UnitType.SWORDSMAN],
            [UnitType.ARCHER]: updatedTargetArmy[UnitType.ARCHER],
            [UnitType.KNIGHT]: updatedTargetArmy[UnitType.KNIGHT],
            [UnitType.LUCHADOR]: updatedTargetArmy[UnitType.LUCHADOR],
            [UnitType.ARCHMAGE]: updatedTargetArmy[UnitType.ARCHMAGE],
          },
        );
      } else {
        await queryRunner.manager.update(
          this.armyEntityRepository.target,
          { settlementId: settlement.id },
          {
            [UnitType.SWORDSMAN]: updatedTargetArmy[UnitType.SWORDSMAN],
            [UnitType.ARCHER]: updatedTargetArmy[UnitType.ARCHER],
            [UnitType.KNIGHT]: updatedTargetArmy[UnitType.KNIGHT],
            [UnitType.LUCHADOR]: updatedTargetArmy[UnitType.LUCHADOR],
            [UnitType.ARCHMAGE]: updatedTargetArmy[UnitType.ARCHMAGE],
          },
        );
        await queryRunner.manager.update(
          this.armyEntityRepository.target,
          { userId: settlement.user.id },
          {
            [UnitType.SWORDSMAN]: updatedSourceArmy[UnitType.SWORDSMAN],
            [UnitType.ARCHER]: updatedSourceArmy[UnitType.ARCHER],
            [UnitType.KNIGHT]: updatedSourceArmy[UnitType.KNIGHT],
            [UnitType.LUCHADOR]: updatedSourceArmy[UnitType.LUCHADOR],
            [UnitType.ARCHMAGE]: updatedSourceArmy[UnitType.ARCHMAGE],
          },
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    const getArmyDetails = (army: any) => {
      return Object.keys(transferArmyDto).reduce((acc, unitType) => {
        acc[unitType] = army[unitType];
        return acc;
      }, {});
    };

    return {
      userArmy: getArmyDetails(updatedTargetArmy),
      settlementArmy: getArmyDetails(updatedSourceArmy),
    };
  }

  changeResources = async (settlementId: string, resourcesUsed: IResource) => {
    const settlement = await this.settlementsEntityRepository.findOne({
      select: include(this.settlementsEntityRepository, [
        'gold',
        'wood',
        'iron',
      ]),
      where: {
        id: settlementId,
      },
    });

    const worldConfig = await this.configService.worldConfig();

    const maxGoldMiningTown =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCastleTown =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldFortifiedSettlement =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCapitolSettlement =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.gold];

    const maxWoodMiningTown =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCastleTown =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodFortifiedSettlement =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCapitolSettlement =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.wood];

    const maxIronMiningTown =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.iron];
    const maxIronCastleTown =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.iron];
    const maxIronFortifiedSettlement =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.iron];
    const maxIronCapitolSettlement =
      worldConfig.SETTLEMENT[SharedSettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.iron];

    return this.armyEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE
          WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldMiningTown})
          WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldCastleTown})
          WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldFortifiedSettlement})
          WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldCapitolSettlement})
        END`,
        wood: () => `CASE
          WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodMiningTown})
          WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodCastleTown})
          WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodFortifiedSettlement})
          WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodCapitolSettlement})
        END`,
        iron: () => `CASE
          WHEN "type" = '${SharedSettlementTypesEnum.MINING_TOWN}' THEN LEAST("iron" + ${resourcesUsed[ResourceTypeEnum.iron]}, ${maxIronMiningTown})
          WHEN "type" = '${SharedSettlementTypesEnum.CASTLE_TOWN}' THEN LEAST("iron" + ${resourcesUsed[ResourceTypeEnum.iron]}, ${maxIronCastleTown})
          WHEN "type" = '${SharedSettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN LEAST("iron" + ${resourcesUsed[ResourceTypeEnum.iron]}, ${maxIronFortifiedSettlement})
          WHEN "type" = '${SharedSettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN LEAST("iron" + ${resourcesUsed[ResourceTypeEnum.iron]}, ${maxIronCapitolSettlement})
        END`,
      })
      .where('id = :id', { id: settlement.id })
      .execute();
  };

  private toPublicSettlementDto(
    settlement: PrivateSettlementDto,
  ): PublicSettlementDto {
    return {
      id: settlement.id,
      name: settlement.name,
      location: settlement.location,
      type: settlement.type,
      user: settlement.user,
    };
  }

  public async findSettlementsInRadiusWithDeleted(
    location: { lat: number; lng: number },
    radius: number,
  ): Promise<SettlementsEntity[]> {
    return this.settlementsEntityRepository
      .createQueryBuilder('settlement')
      .leftJoinAndSelect('settlement.user', 'user')
      .addSelect('user.id')
      .leftJoinAndSelect('settlement.army', 'army')
      .addSelect('army.id')
      .where(
        'ST_DWithin(settlement.location, ST_MakePoint(:lng, :lat)::geography, :distance)',
        {
          lng: location.lng,
          lat: location.lat,
          distance: radius,
        },
      )
      .withDeleted()
      .getMany();
  }

  public async changeSettlementOwner(
    settlementId: string,
    newOwnerId: string,
  ): Promise<PrivateSettlementDto> {
    const settlement = await this.settlementsEntityRepository.findOne({
      where: { id: settlementId },
      relations: ['user', 'army'],
    });

    if (!settlement) {
      throw new NotFoundException(
        `Settlement not found with ID: ${settlementId}`,
      );
    }

    settlement.user.id = newOwnerId;

    await this.settlementsEntityRepository.save(settlement);

    return this.getPrivateSettlementById(settlementId);
  }

  private async findWithinRadius(location: GeoJSON.Point, radius: number) {
    return this.settlementsEntityRepository
      .createQueryBuilder('settlement')
      .where(
        'ST_DWithin(settlement.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)',
        { lng: location.coordinates[0], lat: location.coordinates[1], radius },
      )
      .getMany();
  }

  public async updateSiegeStatus(settlementId: string, isBesieged: boolean) {
    return this.settlementsEntityRepository.update(
      { id: settlementId },
      { isBesieged },
    );
  }

  public async softDeleteSettlement(settlementId: string) {
    return this.settlementsEntityRepository.softDelete({ id: settlementId });
  }

  private upgradeProcessor = async (job: Job<ResponseStartUpgradeDto>) => {
    const settlementUpgradeTime = job.data.settlementUpgradeTime;
    const startTime = Date.now();
    const finishTime = startTime + settlementUpgradeTime;

    while (Date.now() < finishTime) {
      const currentProgress = await this.getUpgradeProgress(
        job.data.settlementId,
        job.data.nextSettlementType,
        job.id,
      );
      if (currentProgress === 100) break;

      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(
        100,
        (elapsedTime / settlementUpgradeTime) * 100,
      );

      await job.updateProgress(progress);

      const remainingTime = finishTime - Date.now();
      if (remainingTime > 0) {
        await sleep(Math.min(1000, remainingTime));
      }
    }
    await job.updateProgress(100);

    await this.upgradeSettlementTypeToNext(
      job.data.settlementId,
      job.data.nextSettlementType,
    );

    return '';
  };

  private async upgradeSettlementTypeToNext(
    settlementId: string,
    nextSettlementType: SettlementTypesEnum,
  ) {
    await this.settlementsEntityRepository.update(settlementId, {
      type: nextSettlementType,
    });
  }

  public async upgradeSettlementType(settlement: PrivateSettlementDto) {
    const worldConfig = await this.configService.worldConfig();
    const upgradeToType = worldConfig.SETTLEMENT[settlement.type]
      .NEXT_TYPE as unknown as SettlementTypesEnum;

    if (!upgradeToType) {
      throw new BadRequestException('Settlement cannot be upgraded further');
    }

    const existingJobs = await this.getUnfinishedUpgradeBySettlementId(
      settlement.id,
    );
    if (existingJobs.length > 0) {
      throw new BadRequestException(
        'An upgrade is already in progress for this settlement',
      );
    }

    const settlementUpgradeTime =
      worldConfig.SETTLEMENT[settlement.type].UPGRADE.TIME_MS;
    const settlementUpgradeCost =
      worldConfig.SETTLEMENT[settlement.type].UPGRADE.COST;

    const goldCost = settlementUpgradeCost[ResourceTypeEnum.gold];
    const woodCost = settlementUpgradeCost[ResourceTypeEnum.wood];
    const ironCost = settlementUpgradeCost[ResourceTypeEnum.iron];
    if (
      settlement.gold < goldCost ||
      settlement.wood < woodCost ||
      settlement.iron < ironCost
    ) {
      throw new BadRequestException('You dont have enough resources');
    }

    const lockedResources = {
      [ResourceTypeEnum.gold]: Math.max(-goldCost),
      [ResourceTypeEnum.wood]: Math.max(-woodCost),
      [ResourceTypeEnum.iron]: Math.max(-ironCost),
    };
    const finishesOn = new Date(Date.now() + settlementUpgradeTime);
    const data: ResponseStartUpgradeDto = {
      settlementId: settlement.id,
      nextSettlementType: upgradeToType,
      settlementUpgradeTime,
      finishesOn,
      lockedResources,
    };

    await this.changeResources(settlement.id, lockedResources);

    const queue = new Queue<ResponseStartUpgradeDto>(
      bullSettlementUpgradeQueueName(settlement.id),
      { connection: this.redis },
    );
    new Worker(
      bullSettlementUpgradeQueueName(settlement.id),
      this.upgradeProcessor,
      { connection: this.redis },
    );
    const job: Job<ResponseStartUpgradeDto> = await queue.add('upgrade', data);
    this.logger.log(
      `Job added to queue for settlement ${settlement.id} with ID: ${job.id}`,
    );
    return job;
  }

  public async getUnfinishedUpgradeBySettlementId(settlementId: string) {
    const queue = new Queue<ResponseStartUpgradeDto>(
      bullSettlementUpgradeQueueName(settlementId),
      { connection: this.redis },
    );
    let jobs = await queue.getJobs(['active', 'waiting', 'delayed']);

    const results = await Promise.all(
      jobs.map(async (job) => {
        const progress = await this.getUpgradeProgress(
          settlementId,
          job.data.nextSettlementType,
          job.id,
        );
        return progress;
      }),
    );
    jobs = jobs.filter((_, index) => !results[index]);
    if (!jobs) {
      return [];
    }

    return jobs;
  }

  private async saveUpgradeProgress(
    settlementId: string,
    nextType: SettlementTypesEnum,
    jobId: number | string,
    progress: number,
  ): Promise<void> {
    const key = settlementUpgradeProgressKey(settlementId, nextType, jobId);
    await this.redis.set(key, progress.toString(), 'EX', 60 * 60 * 24 * 7); // Expire after a week
  }

  private async getUpgradeProgress(
    settlementId: string,
    nextType: SettlementTypesEnum,
    jobId: number | string,
  ): Promise<number> {
    const key = settlementUpgradeProgressKey(settlementId, nextType, jobId);
    const progress = await this.redis.get(key);
    return progress ? parseInt(progress, 10) : 0;
  }

  public async cancelUpgrade(settlementId: string, jobId: string) {
    const queue = new Queue<ResponseStartUpgradeDto>(
      bullSettlementUpgradeQueueName(settlementId),
      { connection: this.redis },
    );
    const job: Job<ResponseStartUpgradeDto> = await queue.getJob(jobId);
    await job.updateProgress(100);
    await this.saveUpgradeProgress(
      settlementId,
      job.data.nextSettlementType,
      jobId,
      100,
    );

    const gold = Math.abs(job.data.lockedResources[ResourceTypeEnum.gold]);
    const wood = Math.abs(job.data.lockedResources[ResourceTypeEnum.wood]);
    const iron = Math.abs(job.data.lockedResources[ResourceTypeEnum.iron]);

    await this.changeResources(settlementId, {
      [ResourceTypeEnum.gold]: gold,
      [ResourceTypeEnum.wood]: wood,
      [ResourceTypeEnum.iron]: iron,
    });

    return 'success';
  }
}
