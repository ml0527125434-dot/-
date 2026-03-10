import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoomStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateRoomStatusDto {
  @ApiProperty({ enum: RoomStatus })
  @IsEnum(RoomStatus)
  status: RoomStatus;
}

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms by location' })
  findAll(@Query('locationId') locationId: string) {
    return this.roomsService.findByLocation(locationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get room statistics' })
  getStats(@Query('locationId') locationId: string) {
    return this.roomsService.getRoomStats(locationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room details' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Get(':id/session')
  @ApiOperation({ summary: 'Get current room session' })
  getCurrentSession(@Param('id') id: string) {
    return this.roomsService.getCurrentSession(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update room status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRoomStatusDto) {
    return this.roomsService.updateStatus(id, dto.status);
  }

  @Post(':id/clean')
  @ApiOperation({ summary: 'Mark room as cleaned' })
  markClean(@Param('id') id: string) {
    return this.roomsService.markClean(id);
  }
}
