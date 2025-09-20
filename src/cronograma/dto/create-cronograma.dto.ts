import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length, IsArray, ArrayNotEmpty } from 'class-validator';

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

    @ApiProperty({
        example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51b9-4856-8abc-123456789abc'],
        description: 'Array de IDs de las aulas donde se realizará la actividad',
        type: [String]
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'Debe especificar al menos un aula' })
    @IsUUID('4', { each: true, message: 'Cada ID de aula debe ser un UUID válido' })
    idAulas: string[];

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del trabajador responsable de la actividad' })
    @IsUUID()
    idTrabajador: string;
}
