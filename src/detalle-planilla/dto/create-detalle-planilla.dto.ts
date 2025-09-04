import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDecimal,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { EstadoPago } from 'src/enums/estado-pago.enum';

export class CreateDetallePlanillaDto {
  @ApiProperty({
    description: 'ID de la planilla mensual',
    example: 'uuid-de-la-planilla',
  })
  @IsUUID(4, { message: 'El ID de la planilla debe ser un UUID válido' })
  idPlanillaMensual: string;

  @ApiProperty({
    description: 'ID del trabajador',
    example: 'uuid-del-trabajador',
  })
  @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
  idTrabajador: string;

  @ApiProperty({
    description: 'Sueldo base del trabajador',
    example: '2500.00',
  })
  @IsString({ message: 'El sueldo base debe ser un string decimal' })
  sueldoBase: string;

  @ApiProperty({
    description: 'Bonificación familiar',
    example: '150.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La bonificación familiar debe ser un string decimal' })
  bonificacionFamiliar?: string;

  @ApiProperty({
    description: 'Asignación familiar',
    example: '100.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La asignación familiar debe ser un string decimal' })
  asignacionFamiliar?: string;

  @ApiProperty({
    description: 'Otros ingresos',
    example: '200.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Otros ingresos debe ser un string decimal' })
  otrosIngresos?: string;

  @ApiProperty({
    description: 'Descuento AFP',
    example: '250.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El descuento AFP debe ser un string decimal' })
  descuentoAfp?: string;

  @ApiProperty({
    description: 'Descuento EsSalud',
    example: '225.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El descuento EsSalud debe ser un string decimal' })
  descuentoEssalud?: string;

  @ApiProperty({
    description: 'Descuento ONP',
    example: '325.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El descuento ONP debe ser un string decimal' })
  descuentoOnp?: string;

  @ApiProperty({
    description: 'Otros descuentos',
    example: '50.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Otros descuentos debe ser un string decimal' })
  otrosDescuentos?: string;

  @ApiProperty({
    description: 'Días trabajados en el mes',
    example: 30,
    required: false,
    minimum: 0,
    maximum: 31,
  })
  @IsOptional()
  @IsInt({ message: 'Los días trabajados deben ser un número entero' })
  @Min(0, { message: 'Los días trabajados no pueden ser negativos' })
  @Max(31, { message: 'Los días trabajados no pueden exceder 31' })
  diasTrabajados?: number;

  @ApiProperty({
    description: 'Días faltados en el mes',
    example: 0,
    required: false,
    minimum: 0,
    maximum: 31,
  })
  @IsOptional()
  @IsInt({ message: 'Los días faltados deben ser un número entero' })
  @Min(0, { message: 'Los días faltados no pueden ser negativos' })
  @Max(31, { message: 'Los días faltados no pueden exceder 31' })
  diasFaltados?: number;

  @ApiProperty({
    description: 'Estado del pago',
    enum: EstadoPago,
    example: EstadoPago.PENDIENTE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoPago, { message: 'Estado de pago inválido' })
  estadoPago?: EstadoPago;

  @ApiProperty({
    description: 'Fecha de pago',
    example: '2025-09-30',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de pago debe ser una fecha válida' })
  fechaPago?: string;

  @ApiProperty({
    description: 'Observaciones sobre el detalle',
    example: 'Pago regular mensual',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;
}
