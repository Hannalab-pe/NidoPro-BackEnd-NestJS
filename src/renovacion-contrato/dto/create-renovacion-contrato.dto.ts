import { IsDateString, IsOptional, IsString, IsUUID, IsDecimal, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRenovacionContratoDto {
    @ApiProperty({
        description: 'ID del contrato anterior',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    idContratoAnterior: string;

    @ApiProperty({
        description: 'ID del contrato nuevo (puede ser el mismo en renovaciones simples)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    idContratoNuevo: string;

    @ApiProperty({
        description: 'Fecha de la renovación (YYYY-MM-DD)',
        example: '2025-09-02'
    })
    @IsDateString()
    fechaRenovacion: string;

    @ApiPropertyOptional({
        description: 'Motivo de la renovación',
        example: 'Extensión por buen desempeño'
    })
    @IsOptional()
    @IsString()
    motivoRenovacion?: string;

    @ApiPropertyOptional({
        description: 'Descripción de los cambios realizados',
        example: 'Fecha fin actualizada de 2025-08-31 a 2025-12-31'
    })
    @IsOptional()
    @IsString()
    cambiosRealizados?: string;

    @ApiProperty({
        description: 'Sueldo anterior del contrato',
        example: '3500.00'
    })
    @IsDecimal({ decimal_digits: '2' })
    sueldoAnterior: string;

    @ApiProperty({
        description: 'Sueldo nuevo del contrato',
        example: '3800.00'
    })
    @IsDecimal({ decimal_digits: '2' })
    sueldoNuevo: string;

    @ApiPropertyOptional({
        description: 'Duración anterior en meses',
        example: 12
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    duracionAnteriorMeses?: number;

    @ApiPropertyOptional({
        description: 'Duración nueva en meses',
        example: 18
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    duracionNuevaMeses?: number;

    @ApiPropertyOptional({
        description: 'Observaciones adicionales',
        example: 'Renovación aprobada por dirección'
    })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiProperty({
        description: 'ID del trabajador que aprobó la renovación',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    aprobadoPor: string;
}
