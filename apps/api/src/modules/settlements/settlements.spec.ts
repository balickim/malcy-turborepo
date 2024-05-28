import { Test, TestingModule } from '@nestjs/testing';
import { Settlements } from './settlements';

describe('Settlements', () => {
  let provider: Settlements;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Settlements],
    }).compile();

    provider = module.get<Settlements>(Settlements);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
