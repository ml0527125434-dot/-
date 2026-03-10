import {
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SendSmsDto {
  @ApiProperty() @IsString() recipientPhone: string;
  @ApiProperty() @IsString() message: string;
}

class ToggleFeatureDto {
  @ApiProperty() @IsBoolean() isEnabled: boolean;
  @ApiPropertyOptional() @IsOptional() config?: any;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard' })
  getDashboard(@Query('locationId') locationId: string) {
    return this.adminService.getDashboard(locationId);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get location settings' })
  getSettings(@Query('locationId') locationId: string) {
    return this.adminService.getSettings(locationId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update location settings' })
  updateSettings(
    @Query('locationId') locationId: string,
    @Body() settings: any,
  ) {
    return this.adminService.updateSettings(locationId, settings);
  }

  @Patch('features/:key')
  @ApiOperation({ summary: 'Toggle feature flag' })
  toggleFeature(
    @Query('locationId') locationId: string,
    @Param('key') key: string,
    @Body() dto: ToggleFeatureDto,
  ) {
    return this.adminService.toggleFeature(
      locationId,
      key,
      dto.isEnabled,
      dto.config,
    );
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS' })
  sendSms(
    @Query('locationId') locationId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: SendSmsDto,
  ) {
    return this.adminService.sendSms(
      locationId,
      adminUserId,
      dto.recipientPhone,
      dto.message,
    );
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get audit log' })
  getAuditLog(@Query('locationId') locationId: string) {
    return this.adminService.getAuditLog(locationId);
  }
}
