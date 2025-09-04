import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, IsDateString, IsBoolean } from "class-validator";

export class CreatePeriodoEscolarDto {
    @ApiProperty({
        description: 'Año escolar',
        example: 2025
    })
    @IsInt({ message: 'El año escolar debe ser un número entero' })
    anioEscolar: number;

    @ApiProperty({
        description: 'Fecha de inicio del periodo escolar',
        example: '2025-03-01'
    })
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD)' })
    fechaInicio: string;

    @ApiProperty({
        description: 'Fecha de fin del periodo escolar',
        example: '2025-12-20'
    })
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD)' })
    fechaFin: string;

    @ApiProperty({
        description: 'Estado activo del periodo escolar',
        example: true,
        required: false
    })
    @IsBoolean({ message: 'El estado debe ser un valor booleano' })
    @IsOptional()
    estaActivo?: boolean;

    @ApiProperty({
        description: 'Descripción del periodo escolar',
        example: 'Año Escolar 2025 - Nido/Kinder',
        required: false
    })
    @IsString({ message: 'La descripción debe ser un texto' })
    @IsOptional()
    descripcion?: string;
}
