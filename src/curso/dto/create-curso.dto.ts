import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateCursoDto {
    @ApiProperty({ example: 'Matemáticas', description: 'Nombre del curso o materia' })
    @IsString()
    @Length(1, 100)
    nombreCurso: string;

    @ApiProperty({ example: 'Curso de matemáticas básicas para primaria', description: 'Descripción del curso', required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ example: true, description: 'Estado activo del curso', required: false })
    @IsOptional()
    @IsBoolean()
    estaActivo?: boolean;
}
