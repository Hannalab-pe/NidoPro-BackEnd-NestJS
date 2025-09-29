import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional, IsNumber, Min, Max, Length, IsDateString, IsEnum } from "class-validator";
import { TipoCalificacion, CalificacionLiteral } from "../enums/tipo-calificacion.enum";
import { IsValidCalificacion } from "../validators/calificacion.validator";

export class CreateEvualuacionDocenteBimestralDto {
    // Campo configurativo para determinar el tipo de calificación
    @ApiProperty({
        description: 'Tipo de calificación a usar para validación',
        enum: TipoCalificacion,
        example: TipoCalificacion.NUMERICA
    })
    @IsEnum(TipoCalificacion, { message: 'Tipo de calificación debe ser NUMERICA o LITERAL' })
    @IsValidCalificacion({ message: 'Los campos de calificación deben coincidir con el tipo seleccionado' })
    tipoCalificacion: TipoCalificacion;

    // CAMPOS NUMÉRICOS (0-20) - Opcionales según configuración
    @ApiProperty({
        description: 'Puntaje numérico de planificación (0-20)',
        example: 18.5,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de planificación debe ser un número' })
    @Min(0, { message: 'El puntaje de planificación mínimo es 0' })
    @Max(20, { message: 'El puntaje de planificación máximo es 20' })
    puntajePlanificacionNumerico?: number;

    @ApiProperty({
        description: 'Puntaje numérico de metodología (0-20)',
        example: 16.5,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de metodología debe ser un número' })
    @Min(0, { message: 'El puntaje de metodología mínimo es 0' })
    @Max(20, { message: 'El puntaje de metodología máximo es 20' })
    puntajeMetodologiaNumerico?: number;

    @ApiProperty({
        description: 'Puntaje numérico de puntualidad (0-20)',
        example: 15.0,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de puntualidad debe ser un número' })
    @Min(0, { message: 'El puntaje de puntualidad mínimo es 0' })
    @Max(20, { message: 'El puntaje de puntualidad máximo es 20' })
    puntajePuntualidadNumerico?: number;

    @ApiProperty({
        description: 'Puntaje numérico de creatividad (0-20)',
        example: 17.0,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de creatividad debe ser un número' })
    @Min(0, { message: 'El puntaje de creatividad mínimo es 0' })
    @Max(20, { message: 'El puntaje de creatividad máximo es 20' })
    puntajeCreatividadNumerico?: number;

    @ApiProperty({
        description: 'Puntaje numérico de comunicación (0-20)',
        example: 19.0,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de comunicación debe ser un número' })
    @Min(0, { message: 'El puntaje de comunicación mínimo es 0' })
    @Max(20, { message: 'El puntaje de comunicación máximo es 20' })
    puntajeComunicacionNumerico?: number;

    // CAMPOS LITERALES (A, B, C, AD) - Opcionales según configuración
    @ApiProperty({
        description: 'Calificación literal de planificación',
        enum: CalificacionLiteral,
        example: CalificacionLiteral.A,
        required: false
    })
    @IsOptional()
    @IsEnum(CalificacionLiteral, { message: 'La calificación de planificación debe ser A, B, C o AD' })
    puntajePlanificacionLiteral?: CalificacionLiteral;

    @ApiProperty({
        description: 'Calificación literal de metodología',
        enum: CalificacionLiteral,
        example: CalificacionLiteral.B,
        required: false
    })
    @IsOptional()
    @IsEnum(CalificacionLiteral, { message: 'La calificación de metodología debe ser A, B, C o AD' })
    puntajeMetodologiaLiteral?: CalificacionLiteral;

    @ApiProperty({
        description: 'Calificación literal de puntualidad',
        enum: CalificacionLiteral,
        example: CalificacionLiteral.A,
        required: false
    })
    @IsOptional()
    @IsEnum(CalificacionLiteral, { message: 'La calificación de puntualidad debe ser A, B, C o AD' })
    puntajePuntualidadLiteral?: CalificacionLiteral;

    @ApiProperty({
        description: 'Calificación literal de creatividad',
        enum: CalificacionLiteral,
        example: CalificacionLiteral.B,
        required: false
    })
    @IsOptional()
    @IsEnum(CalificacionLiteral, { message: 'La calificación de creatividad debe ser A, B, C o AD' })
    puntajeCreatividadLiteral?: CalificacionLiteral;

    @ApiProperty({
        description: 'Calificación literal de comunicación',
        enum: CalificacionLiteral,
        example: CalificacionLiteral.A,
        required: false
    })
    @IsOptional()
    @IsEnum(CalificacionLiteral, { message: 'La calificación de comunicación debe ser A, B, C o AD' })
    puntajeComunicacionLiteral?: CalificacionLiteral;

    // CAMPOS PARA RETROCOMPATIBILIDAD (DEPRECATED)
    @ApiProperty({
        description: '[DEPRECATED] Usar puntajePlanificacionNumerico en su lugar',
        example: 18.5,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de planificación debe ser un número' })
    @Min(0, { message: 'El puntaje de planificación mínimo es 0' })
    @Max(20, { message: 'El puntaje de planificación máximo es 20' })
    puntajePlanificacion?: number;

    @ApiProperty({
        description: '[DEPRECATED] Usar puntajeMetodologiaNumerico en su lugar',
        example: 16.5,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de metodología debe ser un número' })
    @Min(0, { message: 'El puntaje de metodología mínimo es 0' })
    @Max(20, { message: 'El puntaje de metodología máximo es 20' })
    puntajeMetodologia?: number;

    @ApiProperty({
        description: '[DEPRECATED] Usar puntajePuntualidadNumerico en su lugar',
        example: 15.0,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de puntualidad debe ser un número' })
    @Min(0, { message: 'El puntaje de puntualidad mínimo es 0' })
    @Max(20, { message: 'El puntaje de puntualidad máximo es 20' })
    puntajePuntualidad?: number;

    @ApiProperty({
        description: '[DEPRECATED] Usar puntajeCreatividadNumerico en su lugar',
        example: 17.0,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de creatividad debe ser un número' })
    @Min(0, { message: 'El puntaje de creatividad mínimo es 0' })
    @Max(20, { message: 'El puntaje de creatividad máximo es 20' })
    puntajeCreatividad?: number;

    @ApiProperty({
        description: '[DEPRECATED] Usar puntajeComunicacionNumerico en su lugar',
        example: 19.0,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'El puntaje de comunicación debe ser un número' })
    @Min(0, { message: 'El puntaje de comunicación mínimo es 0' })
    @Max(20, { message: 'El puntaje de comunicación máximo es 20' })
    puntajeComunicacion?: number;

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
