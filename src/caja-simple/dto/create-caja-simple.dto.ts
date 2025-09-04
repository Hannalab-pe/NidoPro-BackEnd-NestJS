import { IsString, IsNumber, IsOptional, IsIn, IsUUID, IsDateString, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCajaSimpleDto {
    @ApiProperty({
        description: 'Tipo de movimiento financiero',
        enum: ['INGRESO', 'EGRESO'],
        example: 'INGRESO'
    })
    @IsIn(['INGRESO', 'EGRESO'])
    tipo: string;

    @ApiProperty({
        description: 'Concepto del movimiento financiero',
        minLength: 3,
        maxLength: 200,
        example: 'Pago de Pensión Mensual'
    })
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    concepto: string;

    @ApiProperty({
        description: 'Descripción detallada del movimiento',
        maxLength: 1000,
        required: false,
        example: 'Pago correspondiente al mes de septiembre 2025'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    descripcion?: string;

    @ApiProperty({
        description: 'Monto del movimiento en soles',
        minimum: 0.01,
        example: 350.50
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Type(() => Number)
    @Min(0.01)
    monto: number;

    @ApiProperty({
        description: 'Categoría del movimiento',
        maxLength: 50,
        example: 'PENSION_MENSUAL',
        enum: [
            'PENSION_MENSUAL', 'MATRICULA', 'INGRESO_ADICIONAL', 'MATERIAL_EDUCATIVO', 'OTROS_INGRESOS',
            'PAGO_PLANILLA', 'SUELDO_DOCENTE', 'GASTOS_OPERATIVOS', 'GASTOS_ADMINISTRATIVOS', 'INFRAESTRUCTURA', 'OTROS_GASTOS'
        ]
    })
    @IsString()
    @MaxLength(50)
    categoria: string;

    @ApiProperty({
        description: 'Subcategoría específica del movimiento',
        maxLength: 100,
        required: false,
        example: 'PENSION_REGULAR'
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    subcategoria?: string;

    @ApiProperty({
        description: 'Método de pago utilizado',
        maxLength: 50,
        required: false,
        example: 'EFECTIVO'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    metodoPago?: string;

    @ApiProperty({
        description: 'Número de comprobante o recibo',
        maxLength: 50,
        required: false,
        example: 'REC-001234'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    comprobante?: string;

    @ApiProperty({
        description: 'ID del estudiante relacionado (para ingresos académicos)',
        required: false,
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsOptional()
    @IsUUID()
    idEstudiante?: string;

    @ApiProperty({
        description: 'ID del trabajador beneficiario (para egresos)',
        required: false,
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsOptional()
    @IsUUID()
    idTrabajadorBeneficiario?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra el movimiento',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Estado del movimiento',
        enum: ['CONFIRMADO', 'PENDIENTE'],
        default: 'CONFIRMADO',
        required: false,
        example: 'CONFIRMADO'
    })
    @IsOptional()
    @IsIn(['CONFIRMADO', 'PENDIENTE'])
    estado?: string = 'CONFIRMADO';

    @ApiProperty({
        description: 'Fecha del movimiento (formato ISO). Si no se proporciona, se usa la fecha actual',
        required: false,
        example: '2025-09-04'
    })
    @IsOptional()
    @IsDateString()
    fecha?: string;

    @ApiProperty({
        description: 'ID de la pensión relacionada (para trazabilidad de pagos)',
        required: false,
        example: '550e8400-e29b-41d4-a716-446655440003'
    })
    @IsOptional()
    @IsUUID()
    idPensionRelacionada?: string;

    @ApiProperty({
        description: 'Número de transacción único (se genera automáticamente si no se proporciona)',
        maxLength: 20,
        required: false,
        example: 'CS-20250904-123456'
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    numeroTransaccion?: string;

    @ApiProperty({
        description: 'Referencia externa (número de boleta, factura, etc.)',
        maxLength: 50,
        required: false,
        example: 'BOLETA-0001234'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    referenciaExterna?: string;
}
