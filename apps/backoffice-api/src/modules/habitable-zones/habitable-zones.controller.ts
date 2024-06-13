import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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

  @Post('/create')
  async createHabitableZone(@Body() body: any) {
    return this.habitableZonesService.createHabitableZone(body);
  }
}
