import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

// DTO para un registro individual de asistencia
export class AsistenciaIndividualDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del estudiante' })
    @IsUUID()
    idEstudiante: string;

    @ApiProperty({ example: true, description: 'Si el estudiante asistió o no' })
    @IsBoolean()
    asistio: boolean;

    @ApiProperty({ example: 'Llegó tarde por motivos familiares', description: 'Observaciones sobre la asistencia', required: false })
    @IsOptional()
    @IsString()
    observaciones?: string;
}

// DTO para registro masivo de asistencia
export class CreateAsistenciaMasivaDto {
    @ApiProperty({ example: '2024-12-15', description: 'Fecha de la asistencia (YYYY-MM-DD)' })
    @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
    fecha: string;

    @ApiProperty({ example: '08:30:00', description: 'Hora de registro de asistencia (HH:MM:SS)' })
    @IsString()
    hora: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del aula' })
    @IsUUID()
    idAula: string;

    @ApiProperty({
        type: [AsistenciaIndividualDto],
        description: 'Lista de asistencias de estudiantes',
        example: [
            { idEstudiante: '123e4567-e89b-12d3-a456-426614174000', asistio: true, observaciones: 'Presente' },
            { idEstudiante: '123e4567-e89b-12d3-a456-426614174001', asistio: false, observaciones: 'Falta justificada' }
        ]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AsistenciaIndividualDto)
    asistencias: AsistenciaIndividualDto[];
}

// DTO para registro individual (mantener compatibilidad)
export class CreateAsistenciaDto {
    @ApiProperty({ example: '2024-12-15', description: 'Fecha de la asistencia (YYYY-MM-DD)' })
    @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
    fecha: string;

    @ApiProperty({ example: '08:30:00', description: 'Hora de registro de asistencia (HH:MM:SS)' })
    @IsString()
    hora: string;

    @ApiProperty({ example: true, description: 'Si el estudiante asistió o no' })
    @IsBoolean()
    asistio: boolean;

    @ApiProperty({ example: 'Llegó tarde por motivos familiares', description: 'Observaciones sobre la asistencia', required: false })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del estudiante' })
    @IsUUID()
    idEstudiante: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del aula' })
    @IsUUID()
    idAula: string;
}
