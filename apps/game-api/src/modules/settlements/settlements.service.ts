import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSettlementDto, TransferArmyDto } from 'shared-nestjs';
import {
  IResource,
  ResourceTypeEnum,
  SharedSettlementTypesEnum,
  UnitType,
} from 'shared-types';
import { DataSource, Repository } from 'typeorm';

import { include, includeAll } from '~/common/utils';
import { convertGeoJSONToPoint } from '~/common/utils/postgis';
import { ArmiesService } from '~/modules/armies/armies.service';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigService } from '~/modules/config/config.service';
import { ActionType } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { HabitableZonesService } from '~/modules/habitable-zones/habitable-zones.service';
import {
  PrivateSettlementDto,
  PublicSettlementDto,
} from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
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
    user: IJwtUser,
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
    user: IJwtUser,
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
      select: include(this.settlementsEntityRepository, ['gold', 'wood']),
      where: {
        id: settlementId,
      },
    });

    const gameConfig = await this.configService.gameConfig();

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

  public async findSettlementsInRadius(
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
}
