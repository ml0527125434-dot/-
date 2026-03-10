import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  AssignRoomDto,
  BookingQueryDto,
} from './bookings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings with filters' })
  findAll(@Query() query: BookingQueryDto) {
    return this.bookingsService.findAll(query);
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available time slots for a date' })
  getAvailableSlots(
    @Query('locationId') locationId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.findAvailableSlots(locationId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Post(':id/arrive')
  @ApiOperation({ summary: 'Mark guest as arrived' })
  markArrived(@Param('id') id: string) {
    return this.bookingsService.markArrived(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a room to booking' })
  assignRoom(@Param('id') id: string, @Body() dto: AssignRoomDto) {
    return this.bookingsService.assignRoom(id, dto);
  }

  @Post(':id/ready')
  @ApiOperation({ summary: 'Mark ready for immersion' })
  markReady(@Param('id') id: string) {
    return this.bookingsService.markReady(id);
  }

  @Post(':id/immersion')
  @ApiOperation({ summary: 'Start immersion' })
  startImmersion(@Param('id') id: string) {
    return this.bookingsService.startImmersion(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete booking' })
  complete(@Param('id') id: string) {
    return this.bookingsService.complete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.cancel(id, dto.cancellationReason);
  }
}
