import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TabletService } from './tablet.service';
import {
  IsString,
  IsArray,
  IsInt,
  ValidateNested,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional() @IsOptional() @IsString() trackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() volume?: number;
}

class VolumeDto {
  @ApiProperty() @IsInt() volume: number;
}

class ExitDto {
  @ApiProperty() @IsString() exitMethod: string;
  @ApiPropertyOptional() @IsOptional() @IsString() exitCode?: string;
}

class ExitCodeDto {
  @ApiProperty() @IsString() code: string;
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
  @ApiOperation({ summary: 'Change music track and/or volume' })
  changeMusic(@Param('id') id: string, @Body() dto: MusicDto) {
    return this.tabletService.changeMusic(id, dto.trackId ?? null, dto.volume);
  }

  @Post(':id/volume')
  @ApiOperation({ summary: 'Change music volume' })
  changeVolume(@Param('id') id: string, @Body() dto: VolumeDto) {
    return this.tabletService.changeVolume(id, dto.volume);
  }

  @Post(':id/exit')
  @ApiOperation({ summary: 'Guest exits room (code or main door)' })
  exitRoom(@Param('id') id: string, @Body() dto: ExitDto) {
    return this.tabletService.exitRoom(id, dto.exitMethod, dto.exitCode);
  }

  @Post(':id/exit/verify')
  @ApiOperation({ summary: 'Verify exit code and complete session' })
  verifyExitCode(@Param('id') id: string, @Body() dto: ExitCodeDto) {
    return this.tabletService.verifyExitCode(id, dto.code);
  }
}
