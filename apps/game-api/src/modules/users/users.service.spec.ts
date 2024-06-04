import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersEntity } from '~/modules/users/entities/users.entity';

import { UsersService } from './users.service';

describe('UserService', () => {
  let service: UsersService;
  let mockRepository: MockType<Repository<UsersEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get(getRepositoryToken(UsersEntity));
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

function createMockRepository(): MockType<Repository<UsersEntity>> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
}
