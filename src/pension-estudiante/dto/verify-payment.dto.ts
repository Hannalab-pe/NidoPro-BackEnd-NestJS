import { IsNotEmpty, IsString, IsOptional, IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
    @ApiProperty({
        description: 'Estado de la pensión después de verificación',
        enum: ['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO']
    })
    @IsNotEmpty()
    @IsString()
    @IsIn(['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'])
    estadoPension: string;

    @ApiProperty({ description: 'Observaciones de la verificación' })
    @IsNotEmpty()
    @IsString()
    observaciones: string;

    @ApiProperty({ description: 'Motivo de rechazo si aplica', required: false })
    @IsOptional()
    @IsString()
    motivoRechazo?: string;

    @ApiProperty({
        description: 'ID del trabajador que registra la verificación',
        example: 'uuid-del-trabajador-verificador'
    })
    @IsUUID(4, {
        message: 'El ID del registrador debe ser un UUID válido',
    })
    registradoPor: string;
}
