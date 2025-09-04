import {
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSeguroTrabajadorDto {
  @ApiProperty({
    description: 'ID del trabajador al que se asigna el seguro',
    example: 'uuid-del-trabajador',
  })
  @IsUUID()
  idTrabajador: string;

  @ApiProperty({
    description: 'ID del tipo de seguro',
    example: 'uuid-del-tipo-seguro',
  })
  @IsUUID()
  idTipoSeguro: string;

  @ApiProperty({
    description: 'Fecha de inicio del seguro',
    example: '2025-09-01',
  })
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del seguro',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: 'ID del trabajador que crea el registro',
    example: 'uuid-trabajador-creador',
  })
  @IsUUID()
  creadoPor: string;

  @ApiPropertyOptional({
    description: 'Indica si el seguro está activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones sobre el seguro',
    example: 'Seguro asignado por nuevo contrato',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
