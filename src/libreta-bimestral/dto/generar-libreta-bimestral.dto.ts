import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class GenerarLibretaBimestralDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID del estudiante para quien se generará la libreta bimestral'
    })
    @IsNotEmpty()
    @IsUUID(4, { message: 'ID de estudiante debe ser un UUID válido' })
    idEstudiante: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174001',
        description: 'ID del bimestre para el cual se generará la libreta'
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
}
