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
import { IsUUID, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class OverrideQueueDto {
  @ApiProperty() @IsUUID() bookingId: string;
  @ApiProperty() @IsInt() newPosition: number;
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
}
