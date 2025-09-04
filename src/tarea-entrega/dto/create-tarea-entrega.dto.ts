import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean, IsUrl } from 'class-validator';

export class CreateTareaEntregaDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID de la tarea'
    })
    @IsUUID(4, { message: 'El ID de la tarea debe ser un UUID válido' })
    idTarea: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID del estudiante'
    })
    @IsUUID(4, { message: 'El ID del estudiante debe ser un UUID válido' })
    idEstudiante: string;

    @ApiProperty({
        example: true,
        description: 'Indica si el estudiante realizó la tarea (para kinder)'
    })
    @IsBoolean({ message: 'El campo realizoTarea debe ser verdadero o falso' })
    realizoTarea: boolean;

    @ApiProperty({
        example: 'El niño completó la actividad con ayuda',
        description: 'Observaciones del docente sobre la entrega',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    observaciones?: string;

    @ApiProperty({
        example: 'https://cloudinary.com/foto-tarea.jpg',
        description: 'URL de evidencia fotográfica (opcional)',
        required: false
    })
    @IsOptional()
    @IsUrl({}, { message: 'La URL del archivo debe ser válida' })
    archivoUrl?: string;
}