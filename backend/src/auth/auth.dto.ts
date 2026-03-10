import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ example: '0501234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyCodeDto {
  @ApiProperty({ example: '0501234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  code: string;
}
