// src/contrato-trabajador/dto/create-contrato-trabajador.dto.ts
import { IsUUID, IsString, IsOptional, IsDateString, IsDecimal, IsEnum, IsInt, IsBoolean, IsUrl, Length, Min, Max } from 'class-validator';

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EstadoContratoEnum, JornadaLaboralEnum } from 'src/enums/contrato-trabajador.enum';

export class CreateContratoTrabajadorDto {
    @ApiProperty({ description: 'ID del trabajador', example: 'a3b2c1d4-e5f6-7890-abcd-1234567890ef' })
    @IsUUID()
    idTrabajador: string;

    @ApiProperty({ description: 'ID del tipo de contrato', example: 'b2c3d4e5-f6a7-8901-bcde-2345678901fa' })
    @IsUUID()
    idTipoContrato: string;

    @ApiProperty({ description: 'Número único del contrato', maxLength: 50, example: 'CT-2024-001' })
    @IsString()
    @Length(1, 50)
    numeroContrato: string;

    @ApiProperty({ description: 'Fecha de inicio del contrato (YYYY-MM-DD)', example: '2024-06-01' })
    @IsDateString()
    fechaInicio: string;

    @ApiPropertyOptional({ description: 'Fecha de fin del contrato (YYYY-MM-DD)', example: '2025-06-01' })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin del período de prueba (YYYY-MM-DD)', example: '2024-09-01' })
    @IsOptional()
    @IsDateString()
    fechaFinPeriodoPrueba?: string;

    @ApiProperty({ description: 'Sueldo contratado', example: '3500.00' })
    @IsDecimal({ decimal_digits: '2' })
    sueldoContratado: string;

    @ApiProperty({ description: 'Tipo de jornada laboral', enum: JornadaLaboralEnum, example: JornadaLaboralEnum.COMPLETA })
    @IsEnum(JornadaLaboralEnum)
    jornadaLaboral: JornadaLaboralEnum;

    @ApiPropertyOptional({ description: 'Horas de trabajo por semana', minimum: 1, maximum: 168, example: 40 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(168)
    horasSemanales?: number;

    @ApiProperty({ description: 'Cargo en el contrato', maxLength: 100, example: 'Desarrollador Backend' })
    @IsString()
    @Length(1, 100)
    cargoContrato: string;

    @ApiPropertyOptional({ description: 'Descripción detallada de las funciones', example: 'Desarrollo y mantenimiento de APIs REST.' })
    @IsOptional()
    @IsString()
    descripcionFunciones?: string;

    @ApiProperty({ description: 'Lugar de trabajo', maxLength: 200, example: 'Av. Siempre Viva 123, Ciudad' })
    @IsString()
    @Length(1, 200)
    lugarTrabajo: string;

    @ApiPropertyOptional({ description: 'Estado del contrato', enum: EstadoContratoEnum, example: EstadoContratoEnum.ACTIVO })
    @IsOptional()
    @IsEnum(EstadoContratoEnum)
    estadoContrato?: EstadoContratoEnum;

    @ApiPropertyOptional({ description: 'Observaciones adicionales del contrato', example: 'Contrato sujeto a revisión anual.' })
    @IsOptional()
    @IsString()
    observacionesContrato?: string;

    @ApiPropertyOptional({ description: 'URL del archivo del contrato', example: 'https://ejemplo.com/contratos/ct-2024-001.pdf' })
    @IsOptional()
    @IsUrl()
    archivoContratoUrl?: string;

    @ApiPropertyOptional({ description: 'URL del archivo firmado', example: 'https://ejemplo.com/contratos/ct-2024-001-firmado.pdf' })
    @IsOptional()
    @IsUrl()
    archivoFirmadoUrl?: string;

    @ApiPropertyOptional({ description: 'Si el contrato tiene renovación automática', example: true })
    @IsOptional()
    @IsBoolean()
    renovacionAutomatica?: boolean;

    @ApiPropertyOptional({ description: 'Días de aviso para renovación', minimum: 1, maximum: 365, example: 30 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(365)
    diasAvisoRenovacion?: number;

    @ApiPropertyOptional({ description: 'Fecha de aprobación del contrato (YYYY-MM-DD)', example: '2024-06-02' })
    @IsOptional()
    @IsDateString()
    fechaAprobacion?: string;

    @ApiPropertyOptional({ description: 'ID del trabajador que creó el contrato', example: 'c3d4e5f6-a7b8-9012-cdef-3456789012ab' })
    @IsOptional()
    @IsUUID()
    creadoPor?: string;

    @ApiPropertyOptional({ description: 'ID del trabajador que aprobó el contrato', example: 'd4e5f6a7-b8c9-0123-def0-4567890123bc' })
    @IsOptional()
    @IsUUID()
    aprobadoPor?: string;
}

export class FiltrosContratoDto {
    @ApiPropertyOptional({ description: 'Filtrar por estado del contrato' })
    @IsOptional()
    @IsEnum(EstadoContratoEnum)
    estadoContrato?: EstadoContratoEnum;

    @ApiPropertyOptional({ description: 'Filtrar por tipo de jornada' })
    @IsOptional()
    @IsEnum(JornadaLaboralEnum)
    jornadaLaboral?: JornadaLaboralEnum;

    @ApiPropertyOptional({ description: 'Filtrar por ID del trabajador' })
    @IsOptional()
    @IsUUID()
    idTrabajador?: string;

    @ApiPropertyOptional({ description: 'Fecha de inicio desde (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    fechaInicioDesde?: string;

    @ApiPropertyOptional({ description: 'Fecha de inicio hasta (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    fechaInicioHasta?: string;

    @ApiPropertyOptional({ description: 'Filtrar contratos próximos a vencer (días)' })
    @IsOptional()
    proximosAVencer?: number;
}