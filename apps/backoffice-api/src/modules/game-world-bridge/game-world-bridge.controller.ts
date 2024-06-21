import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GameWorldBridgeService } from './game-world-bridge.service';

@ApiTags('game-world-bridge')
@Controller('game-world-bridge')
export class GameWorldBridgeController {
  constructor(
    private readonly gameWorldBridgeService: GameWorldBridgeService,
  ) {}

  @Get('/settlements')
  async getSettlements(@Headers('x-world-name') worldName: string) {
    return this.gameWorldBridgeService.getSettlements(worldName);
  }
}
