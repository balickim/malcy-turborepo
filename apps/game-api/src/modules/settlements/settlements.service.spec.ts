import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';

import { SettlementsService } from './settlements.service';

describe('SettlementsService', () => {
  let service: SettlementsService;
  let mockRepository: MockType<Repository<SettlementsEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        {
          provide: getRepositoryToken(SettlementsEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<SettlementsService>(SettlementsService);
    mockRepository = module.get(getRepositoryToken(SettlementsEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(mockRepository).toBeDefined();
  });
});

type MockType<T> = {
  [P in keyof T]?: jest.Mock<T>;
};

function createMockRepository(): MockType<Repository<SettlementsEntity>> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
}
