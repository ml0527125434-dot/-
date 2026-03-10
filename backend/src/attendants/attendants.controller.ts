import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendantsService } from './attendants.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Attendant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendant')
export class AttendantsController {
  constructor(private attendantsService: AttendantsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get attendant dashboard' })
  getDashboard(@Query('locationId') locationId: string) {
    return this.attendantsService.getDashboard(locationId);
  }

  @Post('room/:id/arrive')
  @ApiOperation({ summary: 'Attendant arrives at room' })
  arriveAtRoom(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.attendantsService.arriveAtRoom(roomId, userId);
  }

  @Post('room/:id/done')
  @ApiOperation({ summary: 'Complete immersion' })
  completeImmersion(@Param('id') roomId: string) {
    return this.attendantsService.completeImmersion(roomId);
  }
}
