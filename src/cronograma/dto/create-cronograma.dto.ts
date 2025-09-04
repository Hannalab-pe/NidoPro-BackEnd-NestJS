import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCronogramaDto {
    @ApiProperty({ example: 'Reunión de padres de familia', description: 'Nombre de la actividad programada' })
    @IsString()
    @Length(1, 200)
    nombreActividad: string;

    @ApiProperty({ example: 'Reunión informativa sobre el progreso académico del primer bimestre', description: 'Descripción detallada de la actividad', required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ example: '2024-12-15', description: 'Fecha de inicio de la actividad (YYYY-MM-DD)' })
    @IsDateString({}, { message: 'La fecha de inicio debe estar en formato YYYY-MM-DD' })
    fechaInicio: string;

    @ApiProperty({ example: '2024-12-15', description: 'Fecha de fin de la actividad (YYYY-MM-DD)' })
    @IsDateString({}, { message: 'La fecha de fin debe estar en formato YYYY-MM-DD' })
    fechaFin: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del aula donde se realizará la actividad' })
    @IsUUID()
    idAula: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del trabajador responsable de la actividad' })
    @IsUUID()
    idTrabajador: string;
}
