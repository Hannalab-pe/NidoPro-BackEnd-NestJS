import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, IsBoolean } from 'class-validator';

export class CreateApoderadoDto {
    @ApiProperty({ example: 'Juan', description: 'Nombre del apoderado' })
    @IsString()
    @Length(1, 100)
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del apoderado' })
    @IsString()
    @Length(1, 100)
    apellido: string;

    @ApiProperty({ example: '+51987654321', description: 'Número de teléfono', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 20)
    numero?: string;

    @ApiProperty({ example: 'correo@ejemplo.com', description: 'Correo electrónico', required: false })
    @IsOptional()
    @IsEmail()
    @Length(0, 255)
    correo?: string;

    @ApiProperty({ example: 'Av. Siempre Viva 123', description: 'Dirección', required: false })
    @IsOptional()
    @IsString()
    direccion?: string;

    @ApiProperty({ example: 'DNI', description: 'Tipo de documento de identidad del apoderado' })
    @IsString()
    @Length(2, 10)
    tipoDocumentoIdentidad: string;

    @ApiProperty({ example: '12345678', description: 'Número de documento de identidad del apoderado' })
    @IsString()
    @Length(6, 15)
    documentoIdentidad: string;

    @ApiProperty({ example: true, description: 'Es el apoderado principal (quien paga la matrícula)', required: false })
    @IsOptional()
    @IsBoolean()
    esPrincipal?: boolean;

    @ApiProperty({ example: 'madre', description: 'Tipo de apoderado: padre, madre, tutor, abuelo, etc.', required: false })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    tipoApoderado?: string;
}
