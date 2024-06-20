import { Module } from '@nestjs/common';

import { GameWorldBridgeController } from './game-world-bridge.controller';
import { GameWorldBridgeService } from './game-world-bridge.service';

@Module({
  controllers: [GameWorldBridgeController],
  providers: [GameWorldBridgeService],
  exports: [GameWorldBridgeService],
})
export class GameWorldBridgeModule {}
