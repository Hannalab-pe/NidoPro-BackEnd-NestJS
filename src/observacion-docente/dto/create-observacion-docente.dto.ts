import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional, IsEnum, Length, IsDateString } from "class-validator";
import { TipoObservacionDocente } from "src/enums/tipo-observacion-docente.enum";
import { EstadoObservacionDocente } from "src/enums/estado-observacion-docente.enum";

export class CreateObservacionDocenteDto {
    @ApiProperty({
        description: 'Motivo de la observación',
        example: 'Entrega tardía de programación mensual'
    })
    @IsString({ message: 'El motivo debe ser un texto' })
    @Length(5, 100, { message: 'El motivo debe tener entre 5 y 100 caracteres' })
    motivo: string;

    @ApiProperty({
        description: 'Descripción detallada de la observación',
        example: 'La programación del mes de marzo fue entregada 3 días después de la fecha límite establecida'
    })
    @IsString({ message: 'La descripción debe ser un texto' })
    @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
    descripcion: string;

    @ApiProperty({
        description: 'Tipo de observación',
        enum: TipoObservacionDocente,
        example: TipoObservacionDocente.PROGRAMACION_TARDIA
    })
    @IsEnum(TipoObservacionDocente, { message: 'Tipo de observación inválido' })
    tipoObservacion: TipoObservacionDocente;

    @ApiProperty({
        description: 'Estado de la observación',
        enum: EstadoObservacionDocente,
        example: EstadoObservacionDocente.ACTIVA,
        required: false
    })
    @IsOptional()
    @IsEnum(EstadoObservacionDocente, { message: 'Estado de observación inválido' })
    estado?: EstadoObservacionDocente;

    @ApiProperty({
        description: 'ID del bimestre',
        example: 'uuid-del-bimestre'
    })
    @IsUUID(4, { message: 'El ID del bimestre debe ser un UUID válido' })
    idBimestre: string;

    @ApiProperty({
        description: 'ID del trabajador (docente) observado',
        example: 'uuid-del-trabajador'
    })
    @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
    idTrabajador: string;

    @ApiProperty({
        description: 'ID del coordinador que hace la observación',
        example: 'uuid-del-coordinador'
    })
    @IsUUID(4, { message: 'El ID del coordinador debe ser un UUID válido' })
    idCoordinador: string;

    @ApiProperty({
        description: 'Fecha de la observación',
        example: '2025-03-15',
        required: false
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser válida (YYYY-MM-DD)' })
    fechaObservacion?: string;
}
