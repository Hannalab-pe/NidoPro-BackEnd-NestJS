import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
  IsDecimal,
} from 'class-validator';

export class CreateSueldoTrabajadorDto {
  @ApiProperty({
    description: 'ID del trabajador al que se asigna el sueldo',
    example: 'uuid-trabajador',
  })
  @IsUUID()
  idTrabajador: string;

  @ApiProperty({
    description: 'Sueldo base del trabajador',
    example: '2500.00',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  sueldoBase: string;

  @ApiProperty({
    description: 'Bonificación familiar',
    example: '150.00',
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  bonificacionFamiliar?: string;

  @ApiProperty({
    description: 'Asignación familiar',
    example: '100.00',
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  asignacionFamiliar?: string;

  @ApiProperty({
    description: 'Otros ingresos adicionales',
    example: '200.00',
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  otrosIngresos?: string;

  @ApiProperty({
    description: 'Fecha desde la cual es vigente este sueldo (YYYY-MM-DD)',
    example: '2025-09-01',
  })
  @IsDateString()
  fechaVigenciaDesde: string;

  @ApiProperty({
    description: 'Fecha hasta la cual es vigente este sueldo (YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaVigenciaHasta?: string;

  @ApiProperty({
    description: 'ID del trabajador que crea este registro de sueldo',
    example: 'uuid-trabajador-admin',
  })
  @IsUUID()
  creadoPor: string;

  @ApiProperty({
    description: 'Indica si este sueldo está activo',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;

  @ApiProperty({
    description: 'Observaciones sobre el sueldo',
    example: 'Incremento salarial anual',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
