import { IsString, IsNumber, IsOptional, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearIngresoPorPensionDto {
    @ApiProperty({
        description: 'ID del estudiante que realiza el pago',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    idEstudiante: string;

    @ApiProperty({
        description: 'ID de la pensión específica que se está pagando',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsUUID()
    idPensionRelacionada: string;

    @ApiProperty({
        description: 'Monto del pago de la pensión',
        minimum: 0.01,
        example: 350.00
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto: number;

    @ApiProperty({
        description: 'Método de pago utilizado',
        maxLength: 50,
        example: 'EFECTIVO'
    })
    @IsString()
    @MaxLength(50)
    metodoPago: string;

    @ApiProperty({
        description: 'Número de comprobante de pago',
        maxLength: 50,
        required: false,
        example: 'REC-001234'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra el pago',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Observaciones adicionales sobre el pago',
        maxLength: 500,
        required: false,
        example: 'Pago correspondiente al mes de septiembre'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observaciones?: string;
}

export class CrearIngresoPorMatriculaDto {
    @ApiProperty({
        description: 'ID del estudiante que se matricula',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    idEstudiante: string;

    @ApiProperty({
        description: 'Monto de la matrícula',
        minimum: 0.01,
        example: 500.00
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto: number;

    @ApiProperty({
        description: 'Método de pago utilizado',
        maxLength: 50,
        example: 'TRANSFERENCIA_BANCARIA'
    })
    @IsString()
    @MaxLength(50)
    metodoPago: string;

    @ApiProperty({
        description: 'Número de comprobante de pago',
        maxLength: 50,
        required: false,
        example: 'MAT-001234'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra la matrícula',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Período escolar al que corresponde la matrícula',
        maxLength: 50,
        required: false,
        example: '2025-I'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    periodoEscolar?: string;
}

export class CrearEgresoPorPlanillaDto {
    @ApiProperty({
        description: 'ID del trabajador que recibe el pago',
        example: '550e8400-e29b-41d4-a716-446655440003'
    })
    @IsUUID()
    idTrabajadorBeneficiario: string;

    @ApiProperty({
        description: 'Monto del sueldo a pagar',
        minimum: 0.01,
        example: 2500.00
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto: number;

    @ApiProperty({
        description: 'Mes del pago (1-12)',
        minimum: 1,
        maximum: 12,
        example: 9
    })
    @IsNumber()
    @Min(1)
    mes: number;

    @ApiProperty({
        description: 'Año del pago',
        minimum: 2020,
        example: 2025
    })
    @IsNumber()
    @Min(2020)
    anio: number;

    @ApiProperty({
        description: 'Detalle adicional del concepto de pago',
        maxLength: 200,
        required: false,
        example: 'Sueldo básico + bonificación por desempeño'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    conceptoDetalle?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra el pago',
        example: '550e8400-e29b-41d4-a716-446655440004'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Número de comprobante de pago',
        maxLength: 50,
        required: false,
        example: 'PLAN-09-2025-001'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;
}
