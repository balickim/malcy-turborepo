import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { HabitableZonesService } from './habitable-zones.service';

@ApiTags('habitable-zones')
@Controller('habitable-zones')
export class HabitableZonesController {
  constructor(private readonly habitableZonesService: HabitableZonesService) {}
}
