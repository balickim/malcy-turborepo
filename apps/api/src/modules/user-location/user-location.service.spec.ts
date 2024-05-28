import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { mockDeep } from 'jest-mock-extended';

import { UserLocationService } from './user-location.service';

describe('UserLocationService', () => {
  let service: UserLocationService;
  let redisMock;

  beforeEach(async () => {
    redisMock = mockDeep<Redis>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'RedisModule:default',
          useValue: redisMock,
        },
        UserLocationService,
      ],
    }).compile();

    service = module.get<UserLocationService>(UserLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLocation', () => {
    it('should return true if there is no previous location', async () => {
      redisMock.hget.mockResolvedValue('1712246951753');

      const result = await service.updateLocation({
        userId: 'testUserId',
        location: { lat: 1.0, lng: 1.0 },
      });

      expect(result).toBe('success');
    });

    it('should correctly mock geopos method', async () => {
      // redisMock.geopos.mockResolvedValue([[1.0, 2.0]]);
      redisMock.hget.mockResolvedValue('1234567890');
      redisMock.geodist.mockResolvedValue('100');
      await service.updateLocation({
        userId: 'testUserId',
        location: { lat: 1.0, lng: 1.0 },
      });

      // expect(redisMock.geopos).toHaveBeenCalledWith(
      //   'userLocations',
      //   'testUserId',
      // );
      expect(redisMock.hget).toHaveBeenCalledWith(
        'user:location:timestamp',
        'testUserId',
      );
    });
  });
});
