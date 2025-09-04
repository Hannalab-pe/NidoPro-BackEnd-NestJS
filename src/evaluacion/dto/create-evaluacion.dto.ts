import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateEvaluacionDto {
    @ApiProperty({ example: '2024-12-15', description: 'Fecha de la evaluación (YYYY-MM-DD)' })
    @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
    fecha: string;

    @ApiProperty({ example: 'Examen parcial de matemáticas del primer bimestre', description: 'Descripción de la evaluación', required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({
        example: 'EXAMEN',
        description: 'Tipo de evaluación',
        enum: ['EXAMEN', 'PRACTICA', 'TAREA', 'PROYECTO', 'EXPOSICION'],
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    @IsIn(['EXAMEN', 'PRACTICA', 'TAREA', 'PROYECTO', 'EXPOSICION'], {
        message: 'El tipo de evaluación debe ser: EXAMEN, PRACTICA, TAREA, PROYECTO o EXPOSICION'
    })
    tipoEvaluacion?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del curso al que pertenece la evaluación' })
    @IsUUID()
    idCurso: string;
}
