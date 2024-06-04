import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor() {}
}
