import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IResource, ResourceTypeEnum, UnitType } from 'shared-types';
import { Repository } from 'typeorm';

import { include, includeAll } from '~/common/utils';
import { convertGeoJSONToPoint } from '~/common/utils/postgis';
import { ArmiesService } from '~/modules/armies/armies.service';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigService } from '~/modules/config/config.service';
import { ActionType } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { CreateSettlementDto } from '~/modules/settlements/dtos/createSettlementDto';
import {
  PrivateSettlementDto,
  PublicSettlementDto,
} from '~/modules/settlements/dtos/settlements.dto';
import TransferArmyDto from '~/modules/settlements/dtos/transferArmyDto';
import {
  SettlementsEntity,
  SettlementTypesEnum,
} from '~/modules/settlements/entities/settlements.entity';
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

  async pickUpArmy(
    pickUpArmyDto: TransferArmyDto,
    settlement: PrivateSettlementDto,
  ) {
    const areTroopsAvailable = this.armiesService.areTroopsAvailable(
      settlement.army,
      pickUpArmyDto,
    );
    if (!areTroopsAvailable)
      throw new NotFoundException('Not enough troops in the settlement');

    settlement.army[UnitType.SWORDSMAN] -= pickUpArmyDto[UnitType.SWORDSMAN];
    settlement.army[UnitType.ARCHER] -= pickUpArmyDto[UnitType.ARCHER];
    settlement.army[UnitType.KNIGHT] -= pickUpArmyDto[UnitType.KNIGHT];
    settlement.army[UnitType.LUCHADOR] -= pickUpArmyDto[UnitType.LUCHADOR];
    settlement.army[UnitType.ARCHMAGE] -= pickUpArmyDto[UnitType.ARCHMAGE];

    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    userArmy[UnitType.SWORDSMAN] += pickUpArmyDto[UnitType.SWORDSMAN];
    userArmy[UnitType.ARCHER] += pickUpArmyDto[UnitType.ARCHER];
    userArmy[UnitType.KNIGHT] += pickUpArmyDto[UnitType.KNIGHT];
    userArmy[UnitType.LUCHADOR] += pickUpArmyDto[UnitType.LUCHADOR];
    userArmy[UnitType.ARCHMAGE] += pickUpArmyDto[UnitType.ARCHMAGE];

    await this.armyEntityRepository.save(settlement.army);
    await this.armyEntityRepository.save(userArmy);

    return {
      userArmy: {
        [UnitType.SWORDSMAN]: userArmy[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: userArmy[UnitType.ARCHER],
        [UnitType.KNIGHT]: userArmy[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: userArmy[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: userArmy[UnitType.ARCHMAGE],
      },
      settlementArmy: {
        [UnitType.SWORDSMAN]: settlement.army[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: settlement.army[UnitType.ARCHER],
        [UnitType.KNIGHT]: settlement.army[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: settlement.army[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: settlement.army[UnitType.ARCHMAGE],
      },
    };
  }

  async putDownArmy(
    putDownArmyDto: TransferArmyDto,
    settlement: PrivateSettlementDto,
  ) {
    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    if (
      userArmy[UnitType.SWORDSMAN] < putDownArmyDto[UnitType.SWORDSMAN] ||
      userArmy[UnitType.ARCHER] < putDownArmyDto[UnitType.ARCHER] ||
      userArmy[UnitType.KNIGHT] < putDownArmyDto[UnitType.KNIGHT] ||
      userArmy[UnitType.LUCHADOR] < putDownArmyDto[UnitType.LUCHADOR] ||
      userArmy[UnitType.ARCHMAGE] < putDownArmyDto[UnitType.ARCHMAGE]
    ) {
      throw new NotFoundException('Not enough troops in the user army');
    }

    userArmy[UnitType.SWORDSMAN] -= putDownArmyDto[UnitType.SWORDSMAN];
    userArmy[UnitType.ARCHER] -= putDownArmyDto[UnitType.ARCHER];
    userArmy[UnitType.KNIGHT] -= putDownArmyDto[UnitType.KNIGHT];
    userArmy[UnitType.LUCHADOR] -= putDownArmyDto[UnitType.LUCHADOR];
    userArmy[UnitType.ARCHMAGE] -= putDownArmyDto[UnitType.ARCHMAGE];

    settlement.army[UnitType.SWORDSMAN] += putDownArmyDto[UnitType.SWORDSMAN];
    settlement.army[UnitType.ARCHER] += putDownArmyDto[UnitType.ARCHER];
    settlement.army[UnitType.KNIGHT] += putDownArmyDto[UnitType.KNIGHT];
    settlement.army[UnitType.LUCHADOR] += putDownArmyDto[UnitType.LUCHADOR];
    settlement.army[UnitType.ARCHMAGE] += putDownArmyDto[UnitType.ARCHMAGE];

    await this.armyEntityRepository.save(settlement.army);
    await this.armyEntityRepository.save(userArmy);

    return {
      userArmy: {
        [UnitType.SWORDSMAN]: userArmy[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: userArmy[UnitType.ARCHER],
        [UnitType.KNIGHT]: userArmy[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: userArmy[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: userArmy[UnitType.ARCHMAGE],
      },
      settlementArmy: {
        [UnitType.SWORDSMAN]: settlement.army[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: settlement.army[UnitType.ARCHER],
        [UnitType.KNIGHT]: settlement.army[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: settlement.army[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: settlement.army[UnitType.ARCHMAGE],
      },
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
      gameConfig.SETTLEMENT[SettlementTypesEnum.MINING_TOWN].RESOURCES_CAP[
        ResourceTypeEnum.gold
      ];
    const maxGoldCastleTown =
      gameConfig.SETTLEMENT[SettlementTypesEnum.CASTLE_TOWN].RESOURCES_CAP[
        ResourceTypeEnum.gold
      ];
    const maxGoldFortifiedSettlement =
      gameConfig.SETTLEMENT[SettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCapitolSettlement =
      gameConfig.SETTLEMENT[SettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.gold];

    const maxWoodMiningTown =
      gameConfig.SETTLEMENT[SettlementTypesEnum.MINING_TOWN].RESOURCES_CAP[
        ResourceTypeEnum.wood
      ];
    const maxWoodCastleTown =
      gameConfig.SETTLEMENT[SettlementTypesEnum.CASTLE_TOWN].RESOURCES_CAP[
        ResourceTypeEnum.wood
      ];
    const maxWoodFortifiedSettlement =
      gameConfig.SETTLEMENT[SettlementTypesEnum.FORTIFIED_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCapitolSettlement =
      gameConfig.SETTLEMENT[SettlementTypesEnum.CAPITOL_SETTLEMENT]
        .RESOURCES_CAP[ResourceTypeEnum.wood];

    return this.armyEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE 
          WHEN "type" = '${SettlementTypesEnum.MINING_TOWN}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldMiningTown})
          WHEN "type" = '${SettlementTypesEnum.CASTLE_TOWN}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldCastleTown})
          WHEN "type" = '${SettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldFortifiedSettlement})
          WHEN "type" = '${SettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN LEAST("gold" + ${resourcesUsed[ResourceTypeEnum.gold]}, ${maxGoldCapitolSettlement})
        END`,
        wood: () => `CASE 
          WHEN "type" = '${SettlementTypesEnum.MINING_TOWN}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodMiningTown})
          WHEN "type" = '${SettlementTypesEnum.CASTLE_TOWN}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodCastleTown})
          WHEN "type" = '${SettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodFortifiedSettlement})
          WHEN "type" = '${SettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN LEAST("wood" + ${resourcesUsed[ResourceTypeEnum.wood]}, ${maxWoodCapitolSettlement})
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
