import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateGradoDto {
    @ApiProperty({ example: '1ro de Primaria', description: 'Nombre del grado escolar' })
    @IsString()
    @Length(1, 50)
    grado: string;

    @ApiProperty({ example: 'Primer grado de educación primaria', description: 'Descripción del grado', required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ example: true, description: 'Estado activo del grado', required: false })
    @IsOptional()
    @IsBoolean()
    estaActivo?: boolean;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID de la pensión asociada al grado' })
    @IsUUID()
    idPension: string;
}
