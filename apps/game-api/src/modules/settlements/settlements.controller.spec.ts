import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSettlementDto, TransferArmyDto } from 'shared-nestjs';
import { UnitType } from 'shared-types';

import { ArmyRepository } from '~/modules/armies/armies.repository';
import { ArmiesService } from '~/modules/armies/armies.service';
import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';
import { ConfigService } from '~/modules/config/config.service';
import { IExpressRequestWithUserAndSettlement } from '~/modules/settlements/guards/settlement-belongs-to-user.guard';
import { UserLocationService } from '~/modules/user-location/user-location.service';

import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

jest.mock(
  '~/common/decorators/ensure-user-is-within-location.decorator',
  () => ({
    EnsureUserIsWithinLocation: () => () => {
      // Bypass decorator logic
    },
  }),
);

jest.mock(
  '~/common/decorators/ensure-settlement-belongs-to-user.decorator',
  () => ({
    EnsureSettlementBelongsToUserDecorator: () => () => {
      // Bypass decorator logic
    },
  }),
);

const mockSettlementsService = {
  createSettlement: jest.fn(),
  getSettlementById: jest.fn(),
  transferArmy: jest.fn(),
  upgradeSettlementType: jest.fn(),
  getUnfinishedUpgradeBySettlementId: jest.fn(),
  cancelUpgrade: jest.fn(),
};

const mockConfigService = {
  gameConfig: jest.fn().mockResolvedValue({}),
};

const mockArmyRepository = {};

const mockArmiesService = {};

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
};

describe('SettlementsController', () => {
  let controller: SettlementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettlementsController],
      providers: [
        {
          provide: SettlementsService,
          useValue: mockSettlementsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ArmyRepository,
          useValue: mockArmyRepository,
        },
        {
          provide: ArmiesService,
          useValue: mockArmiesService,
        },
        {
          provide: getRedisToken('default'),
          useValue: mockRedis,
        },
        {
          provide: UserLocationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SettlementsController>(SettlementsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSettlement', () => {
    it('should call createSettlement with correct parameters', async () => {
      const createSettlementDto: CreateSettlementDto = {
        name: 'Valid Settlement Name',
        position: { lat: 34.0522, lng: -118.2437 },
      };
      const req: IExpressRequestWithUser<any> = {
        user: { id: 'userId' },
      } as any;

      await controller.createSettlement(req, createSettlementDto);

      expect(mockSettlementsService.createSettlement).toHaveBeenCalledWith(
        createSettlementDto,
        req.user,
      );
    });

    it('should throw an error if DTO validation fails', async () => {
      const createSettlementDto: CreateSettlementDto = {
        name: 'Sh', // Invalid: Too short
        position: { lat: 34.0522, lng: -118.2437 },
      };
      const req: IExpressRequestWithUser<any> = {
        user: { id: 'userId' },
      } as any;

      mockSettlementsService.createSettlement.mockImplementation(() => {
        throw new BadRequestException('Validation failed');
      });

      await expect(
        controller.createSettlement(req, createSettlementDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors gracefully', async () => {
      const createSettlementDto: CreateSettlementDto = {
        name: 'Valid Name',
        position: { lat: 34.0522, lng: -118.2437 },
      };
      const req: IExpressRequestWithUser<any> = {
        user: { id: 'userId' },
      } as any;

      mockSettlementsService.createSettlement.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(
        controller.createSettlement(req, createSettlementDto),
      ).rejects.toThrow(Error);
    });
  });

  describe('getSettlementById', () => {
    it('should call getSettlementById with correct parameters', async () => {
      const settlementId = '1';
      const req: IExpressRequestWithUser<any> = {
        user: { id: 'userId' },
      } as any;

      await controller.getSettlementById(req, { id: settlementId });

      expect(mockSettlementsService.getSettlementById).toHaveBeenCalledWith(
        settlementId,
        req.user,
      );
    });

    it('should handle not found errors gracefully', async () => {
      const settlementId = '999';
      const req: IExpressRequestWithUser<any> = {
        user: { id: 'userId' },
      } as any;

      mockSettlementsService.getSettlementById.mockImplementation(() => {
        throw new Error('Settlement not found');
      });

      await expect(
        controller.getSettlementById(req, { id: settlementId }),
      ).rejects.toThrow(Error);
    });
  });

  describe('pickUpArmy', () => {
    it('should call transferArmy with correct parameters for picking up army', async () => {
      const transferArmyDto: TransferArmyDto = {
        settlementId: 'settlementId',
        [UnitType.ARCHMAGE]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 10,
      };
      const req: IExpressRequestWithUserAndSettlement = {
        user: { id: 'userId' },
        settlement: { id: 'settlementId' },
      } as any;

      await controller.pickUpArmy(req, transferArmyDto);

      expect(mockSettlementsService.transferArmy).toHaveBeenCalledWith(
        transferArmyDto,
        req.settlement,
        true,
      );
    });

    it('should throw a forbidden exception if the user is not within location', async () => {
      const transferArmyDto: TransferArmyDto = {
        settlementId: '123',
        [UnitType.ARCHMAGE]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 10,
      };
      const req: IExpressRequestWithUserAndSettlement = {
        user: { id: 'userId' },
        settlement: { id: 'wrongSettlementId' },
      } as any;

      mockSettlementsService.transferArmy.mockImplementation(() => {
        throw new ForbiddenException('User not within location');
      });

      await expect(controller.pickUpArmy(req, transferArmyDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('putDownArmy', () => {
    it('should call transferArmy with correct parameters for putting down army', async () => {
      const transferArmyDto: TransferArmyDto = {
        settlementId: 'settlementId',
        [UnitType.ARCHMAGE]: 0,
        [UnitType.KNIGHT]: 5,
        [UnitType.LUCHADOR]: 0,
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
      };
      const req: IExpressRequestWithUserAndSettlement = {
        user: { id: 'userId' },
        settlement: { id: 'settlementId' },
      } as any;

      mockSettlementsService.transferArmy.mockImplementation(
        (dto, settlement) => {
          if (dto.settlementId !== settlement.id) {
            throw new ForbiddenException('User not within location');
          }
          return Promise.resolve('success');
        },
      );

      await controller.putDownArmy(req, transferArmyDto);

      expect(mockSettlementsService.transferArmy).toHaveBeenCalledWith(
        transferArmyDto,
        req.settlement,
        false,
      );
    });

    it('should throw a forbidden exception if the user is not within location', async () => {
      const transferArmyDto: TransferArmyDto = {
        settlementId: '123',
        [UnitType.ARCHMAGE]: 0,
        [UnitType.KNIGHT]: 5,
        [UnitType.LUCHADOR]: 0,
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
      };
      const req: IExpressRequestWithUserAndSettlement = {
        user: { id: 'userId' },
        settlement: { id: 'wrongSettlementId' },
      } as any;

      mockSettlementsService.transferArmy.mockImplementation(() => {
        throw new ForbiddenException('User not within location');
      });

      await expect(
        controller.putDownArmy(req, transferArmyDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('upgradeSettlement', () => {
    it('should call upgradeSettlementType with correct parameters', async () => {
      const req: IExpressRequestWithUserAndSettlement = {
        user: { id: 'userId' },
        settlement: { id: 'settlementId' },
      } as any;

      await controller.upgradeSettlement(req);

      expect(mockSettlementsService.upgradeSettlementType).toHaveBeenCalledWith(
        req.settlement,
      );
    });

    it('should throw an error if upgrade fails', async () => {
      const req: IExpressRequestWithUserAndSettlement = {
        user: { id: 'userId' },
        settlement: { id: 'settlementId' },
      } as any;

      mockSettlementsService.upgradeSettlementType.mockImplementation(() => {
        throw new Error('Upgrade failed');
      });

      await expect(controller.upgradeSettlement(req)).rejects.toThrow(Error);
    });
  });

  describe('getUnfinishedJobs', () => {
    it('should call getUnfinishedUpgradeBySettlementId with correct settlementId', async () => {
      const settlementId = '1';

      await controller.getUnfinishedJobs(settlementId);

      expect(
        mockSettlementsService.getUnfinishedUpgradeBySettlementId,
      ).toHaveBeenCalledWith(settlementId);
    });

    it('should handle errors gracefully when fetching unfinished jobs', async () => {
      const settlementId = '1';

      mockSettlementsService.getUnfinishedUpgradeBySettlementId.mockImplementation(
        () => {
          throw new Error('Failed to fetch unfinished jobs');
        },
      );

      await expect(controller.getUnfinishedJobs(settlementId)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('cancelRecruitment', () => {
    it('should call cancelUpgrade with correct parameters', async () => {
      const settlementId = '1';
      const jobId = '2';

      await controller.cancelRecruitment(settlementId, jobId);

      expect(mockSettlementsService.cancelUpgrade).toHaveBeenCalledWith(
        settlementId,
        jobId,
      );
    });

    it('should handle errors gracefully when cancelling recruitment', async () => {
      const settlementId = '1';
      const jobId = '2';

      mockSettlementsService.cancelUpgrade.mockImplementation(() => {
        throw new Error('Cancellation failed');
      });

      await expect(
        controller.cancelRecruitment(settlementId, jobId),
      ).rejects.toThrow(Error);
    });
  });
});
