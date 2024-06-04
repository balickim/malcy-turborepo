import { Test, TestingModule } from '@nestjs/testing';

import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

const mockSettlementsService = {};

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
      ],
    }).compile();

    controller = module.get<SettlementsController>(SettlementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
