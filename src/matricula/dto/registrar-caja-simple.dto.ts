import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class RegistrarMatriculaEnCajaSimpleDto {
    @ApiProperty({
        description: 'ID del trabajador que registra la matrícula en caja simple',
        example: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
        format: 'uuid'
    })
    @IsUUID()
    registradoPor: string;

    @ApiProperty({
        description: 'Número de comprobante o referencia del pago (opcional)',
        example: 'MAT-001234-2025',
        maxLength: 50,
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;
}
