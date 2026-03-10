import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingSource, RoomType } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  locationId: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '20:00' })
  @IsString()
  timeSlotStart: string;

  @ApiProperty({ example: '21:00' })
  @IsString()
  timeSlotEnd: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notesForAttendant?: string;

  @ApiPropertyOptional({ enum: RoomType })
  @IsOptional()
  @IsEnum(RoomType)
  roomTypePreference?: RoomType;

  @ApiPropertyOptional({ enum: BookingSource })
  @IsOptional()
  @IsEnum(BookingSource)
  source?: BookingSource;
}

export class UpdateBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notesForAttendant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}

export class AssignRoomDto {
  @ApiProperty()
  @IsUUID()
  roomId: string;
}

export class BookingQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
