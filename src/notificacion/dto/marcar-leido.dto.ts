import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class MarcarLeidoDto {
  @ApiProperty({
    description: 'Estado de lectura de la notificación',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  leido?: boolean = true;
}
