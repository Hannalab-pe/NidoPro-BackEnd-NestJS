import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsDateString,
    IsOptional,
    IsBoolean,
    Length,
    MaxLength,
} from 'class-validator';

export class CreateAnotacionesEstudianteDto {
    @ApiProperty({
        description: 'ID del trabajador (docente) que realiza la anotación',
        example: 'uuid-del-trabajador',
    })
    @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
    idTrabajador: string;

    @ApiProperty({
        description: 'ID del estudiante sobre quien se hace la anotación',
        example: 'uuid-del-estudiante',
    })
    @IsUUID(4, { message: 'El ID del estudiante debe ser un UUID válido' })
    idEstudiante: string;

    @ApiProperty({
        description: 'Título o asunto de la anotación',
        example: 'Excelente participación en clase',
        maxLength: 200,
    })
    @IsString({ message: 'El título debe ser texto' })
    @Length(1, 200, { message: 'El título debe tener entre 1 y 200 caracteres' })
    titulo: string;

    @ApiProperty({
        description: 'Observación detallada sobre el estudiante',
        example: 'El estudiante mostró gran interés en el tema y participó activamente en las discusiones.',
        required: false,
        maxLength: 1000,
    })
    @IsOptional()
    @IsString({ message: 'La observación debe ser texto' })
    @MaxLength(1000, { message: 'La observación no puede exceder 1000 caracteres' })
    observacion?: string;

    @ApiProperty({
        description: 'Fecha en que ocurrió la situación observada',
        example: '2025-09-03',
        type: String,
        format: 'date',
    })
    @IsDateString({}, { message: 'La fecha de observación debe ser una fecha válida' })
    fechaObservacion: string;

    @ApiProperty({
        description: 'ID del curso relacionado con la anotación',
        example: 'uuid-del-curso',
    })
    @IsUUID(4, { message: 'El ID del curso debe ser un UUID válido' })
    idCurso: string;

    @ApiProperty({
        description: 'Estado activo de la anotación',
        example: true,
        required: false,
        default: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
    estaActivo?: boolean;
}
