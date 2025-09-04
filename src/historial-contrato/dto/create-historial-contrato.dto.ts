import { IsUUID, IsString, IsOptional, Length, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccionHistorialEnum {
    CREACION = 'CREACION',
    ACTIVACION = 'ACTIVACION',
    MODIFICACION = 'MODIFICACION',
    RENOVACION = 'RENOVACION',
    SUSPENSION = 'SUSPENSION',
    TERMINACION = 'TERMINACION',
    RESCISION = 'RESCISION'
}

export class CreateHistorialContratoDto {
    @ApiProperty({ description: 'ID del contrato' })
    @IsUUID()
    idContrato: string;

    @ApiProperty({ description: 'ID del trabajador' })
    @IsUUID()
    idTrabajador: string;

    @ApiProperty({ description: 'Acción realizada', enum: AccionHistorialEnum })
    @IsEnum(AccionHistorialEnum)
    accion: AccionHistorialEnum;

    @ApiPropertyOptional({ description: 'Estado anterior del contrato' })
    @IsOptional()
    @IsString()
    @Length(1, 30)
    estadoAnterior?: string;

    @ApiPropertyOptional({ description: 'Estado nuevo del contrato' })
    @IsOptional()
    @IsString()
    @Length(1, 30)
    estadoNuevo?: string;

    @ApiPropertyOptional({ description: 'Campo que fue modificado' })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    campoModificado?: string;

    @ApiPropertyOptional({ description: 'Valor anterior del campo' })
    @IsOptional()
    @IsString()
    valorAnterior?: string;

    @ApiPropertyOptional({ description: 'Valor nuevo del campo' })
    @IsOptional()
    @IsString()
    valorNuevo?: string;

    @ApiPropertyOptional({ description: 'Motivo de la acción' })
    @IsOptional()
    @IsString()
    @Length(1, 200)
    motivo?: string;

    @ApiPropertyOptional({ description: 'Observaciones adicionales' })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiPropertyOptional({ description: 'URL del archivo de soporte' })
    @IsOptional()
    @IsString()
    archivoSoporteUrl?: string;

    @ApiProperty({ description: 'ID del trabajador que realizó la acción' })
    @IsUUID()
    realizadoPor: string;

    @ApiPropertyOptional({ description: 'IP del usuario' })
    @IsOptional()
    @IsString()
    @Length(1, 45)
    ipUsuario?: string;
}
