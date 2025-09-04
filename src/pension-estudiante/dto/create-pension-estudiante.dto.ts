import { IsNotEmpty, IsNumber, IsString, IsDecimal, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePensionEstudianteDto {
    @ApiProperty({ description: 'ID del estudiante' })
    @IsNotEmpty()
    @IsUUID()
    idEstudiante: string;

    @ApiProperty({ description: 'Mes de la pensión (1-12)' })
    @IsNotEmpty()
    @IsNumber()
    mes: number;

    @ApiProperty({ description: 'Año de la pensión' })
    @IsNotEmpty()
    @IsNumber()
    anio: number;

    @ApiProperty({ description: 'Monto de la pensión' })
    @IsNotEmpty()
    @IsString()
    montoPension: string;

    @ApiProperty({ description: 'Fecha de vencimiento' })
    @IsNotEmpty()
    @IsDateString()
    fechaVencimiento: string;

    @ApiProperty({ description: 'ID del trabajador que registra la pensión' })
    @IsNotEmpty()
    @IsUUID()
    registradoPorId: string;
}
