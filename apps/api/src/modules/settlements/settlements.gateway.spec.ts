import { Test, TestingModule } from '@nestjs/testing';

import { SettlementsGateway } from './settlements.gateway';

describe('SettlementsGateway', () => {
  let gateway: SettlementsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettlementsGateway],
    }).compile();

    gateway = module.get<SettlementsGateway>(SettlementsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
