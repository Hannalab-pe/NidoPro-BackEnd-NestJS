import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsUUID,
    IsArray,
    Min,
    MaxLength,
    ValidateNested,
    IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrarPagoPlanillaCompletaDto {
    @ApiProperty({
        description: 'ID de la planilla mensual a pagar',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    idPlanillaMensual: string;

    @ApiProperty({
        description: 'Método de pago utilizado',
        enum: ['EFECTIVO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'DEPOSITO'],
        example: 'TRANSFERENCIA_BANCARIA'
    })
    @IsString()
    @IsEnum(['EFECTIVO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'DEPOSITO'])
    metodoPago: string;

    @ApiProperty({
        description: 'Número de comprobante del pago',
        maxLength: 50,
        required: false,
        example: 'PLANILLA-09-2025-001'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;

    @ApiProperty({
        description: 'Observaciones sobre el pago de la planilla',
        maxLength: 500,
        required: false,
        example: 'Pago completo de planilla septiembre 2025'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observaciones?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra el pago',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @IsUUID()
    registradoPor: string;
}

export class PagoTrabajadorIndividualDto {
    @ApiProperty({
        description: 'ID del detalle de planilla del trabajador',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsUUID()
    idDetallePlanilla: string;

    @ApiProperty({
        description: 'Método de pago utilizado para este trabajador',
        enum: ['EFECTIVO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'DEPOSITO'],
        example: 'TRANSFERENCIA_BANCARIA'
    })
    @IsString()
    @IsEnum(['EFECTIVO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'DEPOSITO'])
    metodoPago: string;

    @ApiProperty({
        description: 'Número de comprobante específico para este trabajador',
        maxLength: 50,
        required: false,
        example: 'TRANS-001234'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;

    @ApiProperty({
        description: 'Observaciones específicas para este pago',
        maxLength: 500,
        required: false,
        example: 'Pago individual por transferencia bancaria'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observaciones?: string;
}

export class RegistrarPagosTrabajadoresDto {
    @ApiProperty({
        description: 'Array de pagos individuales por trabajador',
        type: [PagoTrabajadorIndividualDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PagoTrabajadorIndividualDto)
    pagosTrabajadores: PagoTrabajadorIndividualDto[];

    @ApiProperty({
        description: 'ID del trabajador que registra todos los pagos',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Observaciones generales sobre los pagos',
        maxLength: 500,
        required: false,
        example: 'Pagos de planilla septiembre 2025 - procesados individualmente'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    observacionesGenerales?: string;
}

export class AutoRegistrarPagoPlanillaDto {
    @ApiProperty({
        description: 'ID de la planilla que se está marcando como pagada',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    idPlanillaMensual: string;

    @ApiProperty({
        description: 'Método de pago por defecto para todos los trabajadores',
        enum: ['EFECTIVO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'DEPOSITO'],
        example: 'TRANSFERENCIA_BANCARIA'
    })
    @IsString()
    @IsEnum(['EFECTIVO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'DEPOSITO'])
    metodoPagoDefecto: string;

    @ApiProperty({
        description: 'Prefijo para los números de comprobante',
        maxLength: 20,
        required: false,
        example: 'PLAN-09-2025'
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    prefijoComprobante?: string;

    @ApiProperty({
        description: 'ID del trabajador que aprueba/procesa el pago',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @IsUUID()
    procesadoPor: string;
}
