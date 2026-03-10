import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TabletService } from './tablet.service';
import {
  IsString,
  IsArray,
  IsInt,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class EquipmentItem {
  @ApiProperty() @IsString() itemType: string;
  @ApiProperty() @IsInt() quantity: number;
}

class RequestEquipmentDto {
  @ApiProperty({ type: [EquipmentItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentItem)
  items: EquipmentItem[];
}

class MusicDto {
  @ApiProperty() @IsString() preference: string;
}

@ApiTags('Tablet')
@Controller('tablet/room')
export class TabletController {
  constructor(private tabletService: TabletService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get room info for tablet' })
  getRoomInfo(@Param('id') id: string) {
    return this.tabletService.getRoomInfo(id);
  }

  @Post(':id/equipment')
  @ApiOperation({ summary: 'Request equipment' })
  requestEquipment(@Param('id') id: string, @Body() dto: RequestEquipmentDto) {
    return this.tabletService.requestEquipment(id, dto.items);
  }

  @Post(':id/ready')
  @ApiOperation({ summary: 'Mark ready for immersion' })
  markReady(@Param('id') id: string) {
    return this.tabletService.markReady(id);
  }

  @Patch(':id/checklist')
  @ApiOperation({ summary: 'Update preparation checklist' })
  updateChecklist(
    @Param('id') id: string,
    @Body() checklist: Record<string, boolean>,
  ) {
    return this.tabletService.updateChecklist(id, checklist);
  }

  @Post(':id/music')
  @ApiOperation({ summary: 'Change music preference' })
  changeMusic(@Param('id') id: string, @Body() dto: MusicDto) {
    return this.tabletService.changeMusic(id, dto.preference);
  }
}
