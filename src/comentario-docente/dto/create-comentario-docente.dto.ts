import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional, IsUrl, Length } from "class-validator";

export class CreateComentarioDocenteDto {
    @ApiProperty({
        description: 'Motivo del comentario docente',
        example: 'Excelente desempeño en clases'
    })
    @IsString({ message: 'El motivo debe ser un texto' })
    @Length(1, 100, { message: 'El motivo debe tener entre 1 y 100 caracteres' })
    motivo: string;

    @ApiProperty({
        description: 'Descripción detallada del comentario',
        example: 'El docente ha demostrado una excelente metodología de enseñanza y manejo de aula durante este período'
    })
    @IsString({ message: 'La descripción debe ser un texto' })
    @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
    descripcion: string;

    @ApiProperty({
        description: 'URL del archivo adjunto (opcional)',
        example: 'https://example.com/evaluacion-docente.pdf',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'La URL del archivo debe ser un texto' })
    @IsUrl({}, { message: 'Debe ser una URL válida' })
    archivoUrl?: string;

    @ApiProperty({
        description: 'ID del trabajador (docente) evaluado',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
    idTrabajador: string;

    @ApiProperty({
        description: 'ID del coordinador que realiza el comentario',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsUUID(4, { message: 'El ID del coordinador debe ser un UUID válido' })
    idCoordinador: string;
}
