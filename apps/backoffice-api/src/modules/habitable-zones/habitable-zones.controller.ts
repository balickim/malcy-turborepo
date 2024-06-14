import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IDtoHabitableZone } from 'shared-types';

import { HabitableZonesService } from './habitable-zones.service';

@ApiTags('habitable-zones')
@Controller('habitable-zones')
export class HabitableZonesController {
  constructor(private readonly habitableZonesService: HabitableZonesService) {}

  @Get('/habitable-zones-in-bounds')
  async findHabitableZonesInBounds(
    @Query('southWestLat') southWestLat: string,
    @Query('southWestLng') southWestLng: string,
    @Query('northEastLat') northEastLat: string,
    @Query('northEastLng') northEastLng: string,
  ) {
    const southWest = {
      lat: parseFloat(southWestLat),
      lng: parseFloat(southWestLng),
    };
    const northEast = {
      lat: parseFloat(northEastLat),
      lng: parseFloat(northEastLng),
    };

    return this.habitableZonesService.findHabitableZonesInBounds(
      southWest,
      northEast,
    );
  }

  @Get('/download/:worldName')
  async downloadHabitableZones(@Query('worldName') worldName: string) {
    return this.habitableZonesService.downloadHabitableZones(worldName);
  }

  @Post('/create')
  async createHabitableZone(@Body() body: IDtoHabitableZone) {
    return this.habitableZonesService.createHabitableZone(body);
  }

  @Put('/edit')
  async editHabitableZone(@Body() body: IDtoHabitableZone) {
    return this.habitableZonesService.editHabitableZone(body);
  }

  @Delete('/delete')
  async deleteHabitableZone(@Body() body: IDtoHabitableZone) {
    return this.habitableZonesService.deleteHabitableZone(body);
  }
}
