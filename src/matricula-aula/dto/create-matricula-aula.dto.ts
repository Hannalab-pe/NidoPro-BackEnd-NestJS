import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDateString, IsOptional, Length } from 'class-validator';

export class CreateMatriculaAulaDto {
    @ApiProperty({
        description: 'ID de la matrícula a asignar al aula',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        format: 'uuid'
    })
    @IsUUID()
    idMatricula: string;

    @ApiProperty({
        description: 'ID del aula donde se asigna la matrícula',
        example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        format: 'uuid'
    })
    @IsUUID()
    idAula: string;

    @ApiProperty({
        description: 'Fecha de asignación de la matrícula al aula',
        example: '2024-03-01',
        type: 'string',
        format: 'date',
        required: false
    })
    @IsOptional()
    @IsDateString()
    fechaAsignacion?: string;

    @ApiProperty({
        description: 'Estado de la asignación',
        example: 'activo',
        required: false,
        maxLength: 20
    })
    @IsOptional()
    @IsString()
    @Length(1, 20)
    estado?: string;
}