import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificacionDto {
  @ApiProperty({ description: 'Título de la notificación', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  titulo: string;

  @ApiProperty({ description: 'Descripción detallada de la notificación' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Fecha de la notificación', required: false })
  @IsOptional()
  @IsDateString()
  fecha?: Date;

  @ApiProperty({
    description: 'UUID del trabajador que recibe la notificación',
  })
  @IsUUID()
  @IsNotEmpty()
  idTrabajador: string;

  @ApiProperty({
    description: 'UUID del trabajador que genera la notificación',
  })
  @IsUUID()
  @IsNotEmpty()
  generadoPor: string;
}
