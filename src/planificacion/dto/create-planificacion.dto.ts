import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional, IsUrl, IsDateString, Length } from "class-validator";

export class CreatePlanificacionDto {
    @ApiProperty({
        description: 'Tipo de planificación',
        example: 'Planificación Anual'
    })
    @IsString({ message: 'El tipo de planificación debe ser un texto' })
    @Length(1, 100, { message: 'El tipo de planificación debe tener entre 1 y 100 caracteres' })
    tipoPlanificacion: string;

    @ApiProperty({
        description: 'Fecha de la planificación',
        example: '2025-03-15'
    })
    @IsDateString({}, { message: 'La fecha de planificación debe ser una fecha válida' })
    fechaPlanificacion: string;

    @ApiProperty({
        description: 'URL del archivo de planificación',
        example: 'https://example.com/planificacion.pdf'
    })
    @IsString({ message: 'La URL del archivo debe ser un texto' })
    @IsUrl({}, { message: 'Debe ser una URL válida' })
    archivoUrl: string;

    @ApiProperty({
        description: 'Observaciones adicionales',
        example: 'Planificación revisada y aprobada',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un texto' })
    observaciones?: string;

    @ApiProperty({
        description: 'ID del trabajador responsable',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
    idTrabajador: string;

    @ApiProperty({
        description: 'ID del aula asignada',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsUUID(4, { message: 'El ID del aula debe ser un UUID válido' })
    idAula: string;
}
