import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateLibretaBimestralDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID del estudiante para generar la libreta bimestral'
    })
    @IsNotEmpty()
    @IsUUID(4, { message: 'ID de estudiante debe ser un UUID válido' })
    idEstudiante: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174001',
        description: 'ID del bimestre para el cual se genera la libreta'
    })
    @IsNotEmpty()
    @IsUUID(4, { message: 'ID de bimestre debe ser un UUID válido' })
    idBimestre: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174002',
        description: 'ID del aula donde estudia el estudiante'
    })
    @IsNotEmpty()
    @IsUUID(4, { message: 'ID de aula debe ser un UUID válido' })
    idAula: string;

    @ApiProperty({
        example: 'El estudiante muestra buen comportamiento en clase y colabora activamente con sus compañeros.',
        description: 'Observaciones sobre la conducta del estudiante durante el bimestre',
        required: false
    })
    @IsOptional()
    @IsString()
    observacionesConducta?: string;

    @ApiProperty({
        example: 'A',
        description: 'Calificación de conducta: A (Excelente), B (Bueno), C (Regular)',
        enum: ['A', 'B', 'C'],
        required: false,
        default: 'A'
    })
    @IsOptional()
    @IsString()
    @IsIn(['A', 'B', 'C'], {
        message: 'La conducta debe ser: A (Excelente), B (Bueno), o C (Regular)'
    })
    conducta?: string;
}
