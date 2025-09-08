import { IsNumber, IsUUID, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcesamientoMasivoDto {
    @ApiProperty({
        description: 'Mes a procesar (1-12)',
        minimum: 1,
        maximum: 12,
        example: 9
    })
    @IsNumber()
    @Min(1)
    @Max(12)
    mes: number;

    @ApiProperty({
        description: 'Año a procesar',
        minimum: 2020,
        example: 2025
    })
    @IsNumber()
    @Min(2020)
    anio: number;

    @ApiProperty({
        description: 'ID del trabajador que registra el procesamiento masivo',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Observaciones adicionales para el procesamiento masivo',
        required: false,
        maxLength: 500,
        example: 'Procesamiento masivo de fin de mes - Septiembre 2025'
    })
    @IsOptional()
    @IsString()
    observaciones?: string;
}

export class ReporteConciliacionDto {
    @ApiProperty({
        description: 'Mes a verificar (1-12)',
        minimum: 1,
        maximum: 12,
        example: 9
    })
    @IsNumber()
    @Min(1)
    @Max(12)
    mes: number;

    @ApiProperty({
        description: 'Año a verificar',
        minimum: 2020,
        example: 2025
    })
    @IsNumber()
    @Min(2020)
    anio: number;
}

export class FiltrosPensionesDto {
    @ApiProperty({
        description: 'Estado de la pensión',
        enum: ['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'],
        required: false,
        example: 'PAGADO'
    })
    @IsOptional()
    @IsString()
    estadoPension?: string;

    @ApiProperty({
        description: 'Mes específico (1-12)',
        minimum: 1,
        maximum: 12,
        required: false,
        example: 9
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(12)
    mes?: number;

    @ApiProperty({
        description: 'Año específico',
        minimum: 2020,
        required: false,
        example: 2025
    })
    @IsOptional()
    @IsNumber()
    @Min(2020)
    anio?: number;

    @ApiProperty({
        description: 'Incluir solo pensiones con ingreso en caja simple',
        required: false,
        example: false
    })
    @IsOptional()
    conIngresoEnCaja?: boolean;

    @ApiProperty({
        description: 'Incluir solo pensiones sin ingreso en caja simple',
        required: false,
        example: true
    })
    @IsOptional()
    sinIngresoEnCaja?: boolean;
}
