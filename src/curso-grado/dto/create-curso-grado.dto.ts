import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsBoolean, IsDateString, IsOptional, ValidateNested, Length } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para crear curso (campos requeridos)
class CreateCursoDataDto {
    @ApiProperty({ example: 'Matemáticas Avanzadas', description: 'Nombre del curso o materia' })
    @IsString()
    @Length(1, 100)
    nombreCurso: string;

    @ApiProperty({ example: 'Curso de matemáticas para nivel secundario', description: 'Descripción del curso', required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ example: true, description: 'Estado activo del curso', required: false })
    @IsOptional()
    @IsBoolean()
    estaActivo?: boolean;
}

// DTO para crear grado (campos requeridos)

export class CreateCursoGradoDto {
    @ApiProperty({ example: true, description: 'Estado activo de la asignación', required: false })
    @IsOptional()
    @IsBoolean()
    estaActivo?: boolean;

    @ApiProperty({
        example: '2025-08-26',
        description: 'Fecha de asignación del curso al grado',
        required: false,
        type: 'string',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    fechaAsignacion?: string;

    // OPCIÓN 1: IDs existentes
    @ApiProperty({
        description: 'ID del curso existente (usar si el curso ya está registrado)',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        format: 'uuid',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idCurso?: string;

    @ApiProperty({
        description: 'ID del grado existente (usar si el grado ya está registrado)',
        example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        format: 'uuid',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idGrado?: string;

    // OPCIÓN 2: Datos para crear nuevos registros
    @ApiProperty({
        description: 'Datos del curso (usar si no existe y se quiere crear)',
        required: false,
        type: CreateCursoDataDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateCursoDataDto)
    cursoData?: CreateCursoDataDto;

}