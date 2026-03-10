import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentGateway } from '@prisma/client';

class CreatePaymentDto {
  @ApiProperty() @IsUUID() bookingId: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @ApiProperty({ enum: PaymentGateway }) @IsEnum(PaymentGateway) gateway: PaymentGateway;
  @ApiPropertyOptional() @IsOptional() @IsString() savedCardToken?: string;
}

class SaveCardDto {
  @ApiProperty() @IsString() token: string;
  @ApiProperty() @IsString() last4: string;
}

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment({ ...dto, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment' })
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }

  @Post('save-card')
  @ApiOperation({ summary: 'Save card for future use' })
  saveCard(@CurrentUser('id') userId: string, @Body() dto: SaveCardDto) {
    return this.paymentsService.saveCard(userId, dto.token, dto.last4);
  }
}
