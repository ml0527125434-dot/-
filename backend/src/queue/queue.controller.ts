import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsUUID, IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OverrideQueueDto {
  @ApiProperty() @IsUUID() bookingId: string;
  @ApiProperty() @IsInt() newPosition: number;
}

class ManualQueueEntryDto {
  @ApiProperty() @IsString() phone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

@ApiTags('Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get()
  @ApiOperation({ summary: 'Get current queue' })
  getQueue(@Query('locationId') locationId: string) {
    return this.queueService.getQueue(locationId);
  }

  @Post('override')
  @ApiOperation({ summary: 'Override queue position (admin)' })
  override(@Body() dto: OverrideQueueDto) {
    return this.queueService.overrideQueue(dto.bookingId, dto.newPosition);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Manually add a walk-in guest to queue (attendant/reception)' })
  manualAdd(
    @Query('locationId') locationId: string,
    @Body() dto: ManualQueueEntryDto,
  ) {
    return this.queueService.addManualEntry(locationId, dto);
  }
}
