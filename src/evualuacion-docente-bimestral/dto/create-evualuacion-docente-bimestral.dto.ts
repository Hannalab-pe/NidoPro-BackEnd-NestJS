import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional, IsNumber, Min, Max, Length, IsDateString } from "class-validator";

export class CreateEvualuacionDocenteBimestralDto {
    @ApiProperty({
        description: 'Puntaje de planificación (0-20)',
        example: 18.5
    })
    @IsNumber({}, { message: 'El puntaje de planificación debe ser un número' })
    @Min(0, { message: 'El puntaje de planificación mínimo es 0' })
    @Max(20, { message: 'El puntaje de planificación máximo es 20' })
    puntajePlanificacion: number;

    @ApiProperty({
        description: 'Puntaje de metodología (0-20)',
        example: 16.5
    })
    @IsNumber({}, { message: 'El puntaje de metodología debe ser un número' })
    @Min(0, { message: 'El puntaje de metodología mínimo es 0' })
    @Max(20, { message: 'El puntaje de metodología máximo es 20' })
    puntajeMetodologia: number;

    @ApiProperty({
        description: 'Puntaje de puntualidad (0-20)',
        example: 15.0
    })
    @IsNumber({}, { message: 'El puntaje de puntualidad debe ser un número' })
    @Min(0, { message: 'El puntaje de puntualidad mínimo es 0' })
    @Max(20, { message: 'El puntaje de puntualidad máximo es 20' })
    puntajePuntualidad: number;

    @ApiProperty({
        description: 'Puntaje de creatividad (0-20)',
        example: 17.0
    })
    @IsNumber({}, { message: 'El puntaje de creatividad debe ser un número' })
    @Min(0, { message: 'El puntaje de creatividad mínimo es 0' })
    @Max(20, { message: 'El puntaje de creatividad máximo es 20' })
    puntajeCreatividad: number;

    @ApiProperty({
        description: 'Puntaje de comunicación (0-20)',
        example: 19.0
    })
    @IsNumber({}, { message: 'El puntaje de comunicación debe ser un número' })
    @Min(0, { message: 'El puntaje de comunicación mínimo es 0' })
    @Max(20, { message: 'El puntaje de comunicación máximo es 20' })
    puntajeComunicacion: number;

    @ApiProperty({
        description: 'ID del trabajador (docente) evaluado',
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
        description: 'ID del coordinador que realiza la evaluación',
        example: 'uuid-del-coordinador'
    })
    @IsUUID(4, { message: 'El ID del coordinador debe ser un UUID válido' })
    idCoordinador: string;

    @ApiProperty({
        description: 'Observaciones adicionales sobre la evaluación',
        example: 'Excelente desempeño en general, mejorar puntualidad en entrega de programaciones',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un texto' })
    @Length(0, 1000, { message: 'Las observaciones no pueden exceder 1000 caracteres' })
    observaciones?: string;

    @ApiProperty({
        description: 'Fecha de la evaluación',
        example: '2025-03-31',
        required: false
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser válida (YYYY-MM-DD)' })
    fechaEvaluacion?: string;
}
