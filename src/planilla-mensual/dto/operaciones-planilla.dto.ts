import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class AprobarPlanillaMensualDto {
  @ApiProperty({
    description: 'ID del trabajador que aprueba la planilla',
    example: 'uuid-del-trabajador-aprobador',
  })
  @IsUUID(4, {
    message: 'El ID del trabajador aprobador debe ser un UUID válido',
  })
  aprobadoPor: string;

  @ApiProperty({
    description: 'Observaciones sobre la aprobación',
    example: 'Planilla aprobada después de revisión de cálculos',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  @Length(0, 500, {
    message: 'Las observaciones no pueden exceder 500 caracteres',
  })
  observaciones?: string;
}

export class RegistrarPagoPlanillaMensualDto {
  @ApiProperty({
    description: 'Fecha real del pago',
    example: '2025-09-30',
    type: String,
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'La fecha de pago real debe ser una fecha válida' },
  )
  fechaPagoReal: string;

  @ApiProperty({
    description: 'ID del trabajador que registra el pago',
    example: 'uuid-del-trabajador-pagador',
  })
  @IsUUID(4, {
    message: 'El ID del trabajador pagador debe ser un UUID válido',
  })
  pagadoPor: string;

  @ApiProperty({
    description: 'Observaciones sobre el pago',
    example: 'Pago realizado por transferencia bancaria',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  @Length(0, 500, {
    message: 'Las observaciones no pueden exceder 500 caracteres',
  })
  observaciones?: string;
}

export class GenerarPlanillaConTrabajadoresDto {
  @ApiProperty({
    description: 'Mes de la planilla (1-12)',
    example: 9,
  })
  mes: number;

  @ApiProperty({
    description: 'Año de la planilla',
    example: 2025,
  })
  anio: number;

  @ApiProperty({
    description: 'Fecha programada para el pago',
    example: '2025-09-30',
  })
  fechaPagoProgramada: string;

  @ApiProperty({
    description: 'IDs de los trabajadores a incluir en la planilla',
    example: ['uuid1', 'uuid2', 'uuid3'],
    type: [String],
  })
  trabajadores: string[];

  @ApiProperty({
    description: 'ID del trabajador que genera la planilla',
    example: 'uuid-del-generador',
  })
  generadoPor: string;
}
