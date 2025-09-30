import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

// DTO para actualizar notas con puntaje numérico
export class UpdateNotaDto {
    @ApiProperty({
        example: 18.50,
        description: 'Puntaje de la nota (0-20)',
        required: false
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El puntaje debe ser un número con máximo 2 decimales' })
    @Min(0, { message: 'El puntaje no puede ser menor a 0' })
    @Max(20, { message: 'El puntaje no puede ser mayor a 20' })
    puntaje?: number;

    @ApiProperty({
        example: true,
        description: 'Indica si la nota está aprobada',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    estaAprobado?: boolean;

    @ApiProperty({
        example: 'Excelente trabajo en el examen',
        description: 'Observaciones sobre la nota',
        required: false
    })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID de la evaluación',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idEvaluacion?: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID del estudiante',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idEstudiante?: string;
}

// DTO para actualizar notas con calificación literal (sistema kinder)
export class UpdateNotaKinderDto {
    @ApiProperty({
        example: 'A',
        description: 'Calificación literal: AD (Logro destacado), A (Logro esperado), B (En proceso), C (En inicio)',
        enum: ['AD', 'A', 'B', 'C'],
        required: false
    })
    @IsOptional()
    @IsString()
    @IsIn(['AD', 'A', 'B', 'C'], {
        message: 'La calificación debe ser: AD (Logro destacado), A (Logro esperado), B (En proceso), o C (En inicio)'
    })
    calificacion?: string;

    @ApiProperty({
        example: 'Excelente trabajo en el área',
        description: 'Observaciones sobre el desempeño',
        required: false
    })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID de la evaluación',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idEvaluacion?: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID del estudiante',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idEstudiante?: string;
}
