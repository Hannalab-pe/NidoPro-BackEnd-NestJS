import { IsNotEmpty, IsString, IsOptional, IsIn, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentMasivoDto {
    @ApiProperty({
        description: 'IDs de las pensiones a verificar masivamente',
        example: ['uuid-pension-1', 'uuid-pension-2', 'uuid-pension-3'],
        type: [String],
    })
    @IsArray({ message: 'Los IDs de pensiones deben ser un array' })
    @IsUUID(4, {
        each: true,
        message: 'Cada ID de pensión debe ser un UUID válido',
    })
    idsPensiones: string[];

    @ApiProperty({
        description: 'Estado de las pensiones después de verificación masiva',
        enum: ['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'],
        example: 'PAGADO'
    })
    @IsNotEmpty()
    @IsString()
    @IsIn(['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'])
    estadoPension: string;

    @ApiProperty({
        description: 'Observaciones de la verificación masiva',
        example: 'Pagos verificados masivamente después de revisión de vouchers'
    })
    @IsNotEmpty()
    @IsString()
    observaciones: string;

    @ApiProperty({
        description: 'Motivo de rechazo si aplica (para estado PENDIENTE)',
        required: false,
        example: 'Vouchers no legibles'
    })
    @IsOptional()
    @IsString()
    motivoRechazo?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra la verificación masiva',
        example: 'uuid-del-trabajador-verificador'
    })
    @IsUUID(4, {
        message: 'El ID del registrador debe ser un UUID válido',
    })
    registradoPor: string;
}
