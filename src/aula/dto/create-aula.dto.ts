import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateAulaDto {
    @ApiProperty({ example: 'A', description: 'Sección del aula' })
    @IsString()
    @Length(1, 10)
    seccion: string;

    @ApiProperty({ example: 30, description: 'Cantidad de estudiantes en el aula', required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    cantidadEstudiantes?: number;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del grado al que pertenece el aula' })
    @IsUUID()
    idGrado: string;
}
