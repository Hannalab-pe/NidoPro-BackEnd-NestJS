import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsUUID,
  Length,
} from 'class-validator';
import { EstadoPlanilla } from 'src/enums/estado-planilla.enum';

export class CreatePlanillaMensualDto {
  @ApiProperty({
    description: 'Mes de la planilla (1-12)',
    example: 9,
    minimum: 1,
    maximum: 12,
  })
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser mínimo 1' })
  @Max(12, { message: 'El mes debe ser máximo 12' })
  mes: number;

  @ApiProperty({
    description: 'Año de la planilla',
    example: 2025,
    minimum: 2020,
  })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor a 2020' })
  anio: number;

  @ApiProperty({
    description: 'Fecha programada para el pago de la planilla',
    example: '2025-09-30',
    type: String,
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'La fecha de pago programada debe ser una fecha válida' },
  )
  fechaPagoProgramada: string;

  @ApiProperty({
    description: 'Estado de la planilla',
    enum: EstadoPlanilla,
    example: EstadoPlanilla.GENERADA,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoPlanilla, { message: 'Estado de planilla inválido' })
  estadoPlanilla?: EstadoPlanilla;

  @ApiProperty({
    description: 'Observaciones sobre la planilla',
    example: 'Planilla generada automáticamente para septiembre 2025',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  @Length(0, 1000, {
    message: 'Las observaciones no pueden exceder 1000 caracteres',
  })
  observaciones?: string;

  @ApiProperty({
    description: 'ID del trabajador que genera la planilla',
    example: 'uuid-del-trabajador-generador',
  })
  @IsUUID(4, {
    message: 'El ID del trabajador generador debe ser un UUID válido',
  })
  generadoPor: string;

  @ApiProperty({
    description: 'ID del trabajador que aprueba la planilla',
    example: 'uuid-del-trabajador-aprobador',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, {
    message: 'El ID del trabajador aprobador debe ser un UUID válido',
  })
  aprobadoPor?: string;

  @ApiProperty({
    description: 'ID del trabajador que registra el pago',
    example: 'uuid-del-trabajador-pagador',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, {
    message: 'El ID del trabajador pagador debe ser un UUID válido',
  })
  pagadoPor?: string;
}
