import {
    IsString,
    IsOptional,
    IsBoolean,
    IsInt,
    MaxLength,
    Min,
    Max,
    IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTipoContratoDto {
    @ApiProperty({
        description: 'Nombre del tipo de contrato',
        example: 'Contrato Indefinido',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombreTipo: string;

    @ApiPropertyOptional({
        description: 'Descripción detallada del tipo de contrato',
        example: 'Contrato sin fecha de término específica, para personal permanente'
    })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiPropertyOptional({
        description: 'Duración máxima en meses (null para contratos indefinidos)',
        example: 12,
        minimum: 1,
        maximum: 120
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    @Max(120)
    duracionMaximaMeses?: number;

    @ApiPropertyOptional({
        description: 'Indica si el contrato permite renovación',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    permiteRenovacion?: boolean;

    @ApiPropertyOptional({
        description: 'Indica si requiere período de prueba',
        example: false,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    requierePeriodoPrueba?: boolean;

    @ApiPropertyOptional({
        description: 'Duración del período de prueba en días',
        example: 90,
        minimum: 1,
        maximum: 365,
        default: 90
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    @Max(365)
    duracionPeriodoPruebaDias?: number;

    @ApiPropertyOptional({
        description: 'Indica si es un contrato temporal',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    esTemporal?: boolean;

    @ApiPropertyOptional({
        description: 'Código identificador del tipo de contrato',
        example: 'CI-001',
        maxLength: 20
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    codigo?: string;

    @ApiPropertyOptional({
        description: 'Estado activo del tipo de contrato',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    estaActivo?: boolean;
}
