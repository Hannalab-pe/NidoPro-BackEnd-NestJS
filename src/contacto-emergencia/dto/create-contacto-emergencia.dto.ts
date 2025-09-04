import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional, IsEmail, IsBoolean, IsNumber, IsUUID } from "class-validator";

export class CreateContactoEmergenciaDto {
    @ApiProperty({ example: 'María', description: 'Nombre del contacto de emergencia' })
    @IsString()
    @Length(1, 100)
    nombre: string;

    @ApiProperty({ example: 'González', description: 'Apellido del contacto de emergencia' })
    @IsString()
    @Length(1, 100)
    apellido: string;

    @ApiProperty({ example: '+51987654321', description: 'Número de teléfono del contacto' })
    @IsString()
    @Length(1, 20)
    telefono: string;

    @ApiProperty({ example: 'maria.gonzalez@email.com', description: 'Correo electrónico del contacto', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'madre', description: 'Tipo de contacto (padre, madre, tío, etc.)' })
    @IsString()
    @Length(1, 50)
    tipoContacto: string;

    @ApiProperty({ example: 'Madre del estudiante', description: 'Relación del contacto con el estudiante' })
    @IsString()
    @Length(1, 100)
    relacionEstudiante: string;

    @ApiProperty({ example: true, description: 'Indica si es el contacto principal', required: false })
    @IsOptional()
    @IsBoolean()
    esPrincipal?: boolean;

    @ApiProperty({ example: 1, description: 'Prioridad del contacto (1 = mayor prioridad)', required: false })
    @IsOptional()
    @IsNumber()
    prioridad?: number;

    @ApiProperty({ example: 'Disponible las 24 horas', description: 'Observaciones adicionales', required: false })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID del estudiante al que pertenece este contacto de emergencia'
    })
    @IsUUID()
    idEstudiante: string;
}