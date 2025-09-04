import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsInt,
    IsEnum,
    IsDateString,
    IsUUID,
    Min,
    Max,
} from 'class-validator';
import { EstadoPlanilla } from 'src/enums/estado-planilla.enum';
import { Transform } from 'class-transformer';

export class ConsultaPlanillaMensualDto {
    @ApiProperty({
        description: 'Mes específico de consulta (1-12)',
        example: 9,
        required: false,
        minimum: 1,
        maximum: 12,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt({ message: 'El mes debe ser un número entero' })
    @Min(1, { message: 'El mes debe ser mínimo 1' })
    @Max(12, { message: 'El mes debe ser máximo 12' })
    mes?: number;

    @ApiProperty({
        description: 'Año específico de consulta',
        example: 2025,
        required: false,
        minimum: 2020,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt({ message: 'El año debe ser un número entero' })
    @Min(2020, { message: 'El año debe ser mayor a 2020' })
    anio?: number;

    @ApiProperty({
        description: 'Estado de la planilla a filtrar',
        enum: EstadoPlanilla,
        example: EstadoPlanilla.APROBADA,
        required: false,
    })
    @IsOptional()
    @IsEnum(EstadoPlanilla, { message: 'Estado de planilla inválido' })
    estadoPlanilla?: EstadoPlanilla;

    @ApiProperty({
        description: 'Fecha de generación desde (formato: YYYY-MM-DD)',
        example: '2025-01-01',
        required: false,
        type: String,
        format: 'date',
    })
    @IsOptional()
    @IsDateString(
        {},
        { message: 'La fecha desde debe ser una fecha válida' },
    )
    fechaGeneracionDesde?: string;

    @ApiProperty({
        description: 'Fecha de generación hasta (formato: YYYY-MM-DD)',
        example: '2025-12-31',
        required: false,
        type: String,
        format: 'date',
    })
    @IsOptional()
    @IsDateString(
        {},
        { message: 'La fecha hasta debe ser una fecha válida' },
    )
    fechaGeneracionHasta?: string;

    @ApiProperty({
        description: 'ID del trabajador que generó la planilla',
        example: 'uuid-del-trabajador-generador',
        required: false,
    })
    @IsOptional()
    @IsUUID(4, {
        message: 'El ID del trabajador generador debe ser un UUID válido',
    })
    generadoPor?: string;

    @ApiProperty({
        description: 'ID del trabajador que aprobó la planilla',
        example: 'uuid-del-trabajador-aprobador',
        required: false,
    })
    @IsOptional()
    @IsUUID(4, {
        message: 'El ID del trabajador aprobador debe ser un UUID válido',
    })
    aprobadoPor?: string;
}
