import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async getSchedules(@Query('locationId') locationId: string) {
    return this.schedulesService.getSchedules(locationId);
  }

  @Put()
  @UseGuards(AdminGuard)
  async updateSchedules(
    @Query('locationId') locationId: string,
    @Body() data: any,
  ) {
    return this.schedulesService.updateSchedules(locationId, data);
  }

  @Get('overrides')
  async getOverrides(@Query('locationId') locationId: string) {
    return this.schedulesService.getOverrides(locationId);
  }

  @Post('overrides')
  @UseGuards(AdminGuard)
  async createOverride(
    @Query('locationId') locationId: string,
    @Body() data: any,
  ) {
    return this.schedulesService.createOverride(locationId, data);
  }

  @Delete('overrides/:id')
  @UseGuards(AdminGuard)
  async deleteOverride(@Param('id') id: string) {
    return this.schedulesService.deleteOverride(id);
  }
}
