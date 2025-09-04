import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadVoucherDto {
    @ApiProperty({ description: 'Número del comprobante de pago' })
    @IsNotEmpty()
    @IsString()
    numeroComprobante: string;

    @ApiProperty({ description: 'Método de pago utilizado' })
    @IsNotEmpty()
    @IsString()
    metodoPago: string;

    @ApiProperty({ description: 'Fecha en que se realizó el pago' })
    @IsNotEmpty()
    @IsDateString()
    fechaPago: string;

    @ApiProperty({ description: 'Monto pagado' })
    @IsNotEmpty()
    @IsString()
    montoPagado: string;

    @ApiProperty({ description: 'Observaciones adicionales', required: false })
    @IsOptional()
    @IsString()
    observaciones?: string;
}
