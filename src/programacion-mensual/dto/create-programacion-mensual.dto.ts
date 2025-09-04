import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsInt, IsUUID, IsOptional, IsUrl, IsEnum, Min, Max, Length } from "class-validator";
import { EstadoProgramacionMensual } from "src/enums/estado-programacion-mensual.enum";

export class CreateProgramacionMensualDto {
    @ApiProperty({
        description: 'Título de la programación mensual',
        example: 'Programación Mensual - Marzo 2025 - Aula A'
    })
    @IsString({ message: 'El título debe ser un texto' })
    @Length(5, 200, { message: 'El título debe tener entre 5 y 200 caracteres' })
    titulo: string;

    @ApiProperty({
        description: 'Descripción detallada de la programación',
        example: 'Programación de actividades académicas para el mes de marzo en el primer bimestre'
    })
    @IsString({ message: 'La descripción debe ser un texto' })
    @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
    descripcion: string;

    @ApiProperty({
        description: 'Mes de la programación (1-12)',
        example: 3
    })
    @IsInt({ message: 'El mes debe ser un número entero' })
    @Min(1, { message: 'El mes debe ser mínimo 1' })
    @Max(12, { message: 'El mes debe ser máximo 12' })
    mes: number;

    @ApiProperty({
        description: 'Año de la programación',
        example: 2025
    })
    @IsInt({ message: 'El año debe ser un número entero' })
    @Min(2020, { message: 'El año debe ser mayor a 2020' })
    anio: number;

    @ApiProperty({
        description: 'ID del trabajador (docente)',
        example: 'uuid-del-trabajador'
    })
    @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
    idTrabajador: string;

    @ApiProperty({
        description: 'ID del bimestre',
        example: 'uuid-del-bimestre'
    })
    @IsUUID(4, { message: 'El ID del bimestre debe ser un UUID válido' })
    idBimestre: string;

    @ApiProperty({
        description: 'ID del aula',
        example: 'uuid-del-aula'
    })
    @IsUUID(4, { message: 'El ID del aula debe ser un UUID válido' })
    idAula: string;

    @ApiProperty({
        description: 'URL del archivo de programación',
        example: 'https://storage.com/programacion-marzo-2025.pdf',
        required: false
    })
    @IsOptional()
    @IsUrl({}, { message: 'Debe ser una URL válida' })
    archivoUrl?: string;

    @ApiProperty({
        description: 'Estado de la programación',
        enum: EstadoProgramacionMensual,
        example: EstadoProgramacionMensual.PENDIENTE,
        required: false
    })
    @IsOptional()
    @IsEnum(EstadoProgramacionMensual, { message: 'Estado inválido' })
    estado?: EstadoProgramacionMensual;

    @ApiProperty({
        description: 'Observaciones adicionales',
        example: 'Incluye actividades especiales por el mes de la mujer',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un texto' })
    @Length(0, 500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
    observaciones?: string;
}
