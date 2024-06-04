import { Test, TestingModule } from '@nestjs/testing';

import { Chat } from './chat';

describe('Settlements', () => {
  let provider: Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Chat],
    }).compile();

    provider = module.get<Chat>(Chat);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
