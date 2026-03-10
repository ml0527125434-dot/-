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
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  async getPricingRules(@Query('locationId') locationId: string) {
    return this.pricingService.getRules(locationId);
  }

  @Post()
  @UseGuards(AdminGuard)
  async createRule(
    @Query('locationId') locationId: string,
    @Body() data: any,
  ) {
    return this.pricingService.createRule(locationId, data);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async updateRule(@Param('id') id: string, @Body() data: any) {
    return this.pricingService.updateRule(id, data);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteRule(@Param('id') id: string) {
    return this.pricingService.deleteRule(id);
  }
}
