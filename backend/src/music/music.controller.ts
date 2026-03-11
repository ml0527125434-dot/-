import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MusicService } from './music.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateTrackDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() artist?: string;
  @ApiProperty() @IsString() url: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() duration?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

class UpdateTrackDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() artist?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() duration?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() sortOrder?: number;
}

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(private musicService: MusicService) {}

  // Public - for tablet
  @Get('tracks')
  @ApiOperation({ summary: 'Get active music tracks for a location' })
  getTracks(@Query('locationId') locationId: string) {
    return this.musicService.getTracks(locationId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default track' })
  getDefaultTrack(@Query('locationId') locationId: string) {
    return this.musicService.getDefaultTrack(locationId);
  }

  // Admin only
  @Get('tracks/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all tracks including inactive (admin)' })
  getAllTracks(@Query('locationId') locationId: string) {
    return this.musicService.getAllTracks(locationId);
  }

  @Post('tracks')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Add a music track (admin)' })
  createTrack(
    @Query('locationId') locationId: string,
    @Body() dto: CreateTrackDto,
  ) {
    return this.musicService.createTrack(locationId, dto);
  }

  @Patch('tracks/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update a music track (admin)' })
  updateTrack(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.musicService.updateTrack(id, dto);
  }

  @Delete('tracks/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Soft delete a music track (admin)' })
  deleteTrack(@Param('id') id: string) {
    return this.musicService.deleteTrack(id);
  }

  @Post('tracks/:id/set-default')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Set track as default background music' })
  setDefault(
    @Query('locationId') locationId: string,
    @Param('id') id: string,
  ) {
    return this.musicService.setDefaultTrack(locationId, id);
  }
}
