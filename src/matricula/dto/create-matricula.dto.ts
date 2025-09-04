import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDecimal, IsDateString, IsOptional, IsEnum, ValidateNested, IsEmail, Length, IsNumber, IsBoolean } from 'class-validator';
import { MetodoPago } from 'src/enums/metodo-pago.enum';
import { Type } from 'class-transformer';

// DTO para crear apoderado (campos requeridos)
class CreateApoderadoDataDto {
    @ApiProperty({ example: 'Juan', description: 'Nombre del apoderado' })
    @IsString()
    @Length(1, 100)
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del apoderado' })
    @IsString()
    @Length(1, 100)
    apellido: string;

    @ApiProperty({ example: 'DNI', description: 'Tipo de documento de identidad del apoderado' })
    @IsString()
    @Length(2, 10)
    tipoDocumentoIdentidad: string;

    @ApiProperty({ example: '12345678', description: 'Número de documento de identidad del apoderado' })
    @IsString()
    @Length(6, 15)
    documentoIdentidad: string;

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

class CreateContactoEmergenciaDataDto {
    @ApiProperty({ example: 'María', description: 'Nombre del contacto' })
    @IsString()
    @Length(1, 100)
    nombre: string;

    @ApiProperty({ example: 'González', description: 'Apellido del contacto' })
    @IsString()
    @Length(1, 100)
    apellido: string;

    @ApiProperty({ example: '+51987654321', description: 'Teléfono del contacto' })
    @IsString()
    @Length(1, 20)
    telefono: string;

    @ApiProperty({ example: 'maria@email.com', description: 'Email del contacto', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'madre', description: 'Tipo de contacto' })
    @IsString()
    @Length(1, 50)
    tipoContacto: string;

    @ApiProperty({ example: 'Madre', description: 'Relación con el estudiante' })
    @IsString()
    relacionEstudiante: string;

    @ApiProperty({ example: true, description: 'Es contacto principal?', required: false })
    @IsOptional()
    @IsBoolean()
    esPrincipal?: boolean;

    @ApiProperty({ example: 1, description: 'Prioridad de contacto', required: false })
    @IsOptional()
    @IsNumber()
    prioridad?: number;
}

class CreateEstudianteDataDto {
    @ApiProperty({ description: 'Nombre del estudiante' })
    @IsString()
    nombre: string;

    @ApiProperty({ description: 'Apellido del estudiante' })
    @IsString()
    apellido: string;

    @ApiProperty({ description: 'Número de documento' })
    @IsString()
    nroDocumento: string;

    @ApiProperty({ description: 'ID del rol del estudiante' })
    @IsUUID()
    idRol: string;

    @ApiProperty({ description: 'Tipo de documento', required: false })
    @IsOptional()
    @IsString()
    tipoDocumento?: string;

    @ApiProperty({ description: 'Observaciones', required: false })
    @IsOptional()
    @IsString()
    observaciones?: string;

    // ✅ AGREGAR el array de contactos:
    @ApiProperty({
        description: 'Lista de contactos de emergencia',
        required: false,
        type: [CreateContactoEmergenciaDataDto]
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateContactoEmergenciaDataDto)
    contactosEmergencia?: CreateContactoEmergenciaDataDto[];

    @ApiProperty({
        required: false,
        description: 'URL de la imagen del estudiante'
    })
    @IsString()
    @IsOptional()
    imagen_estudiante?: string;
}

export class CreateMatriculaDto {
    @ApiProperty({
        description: 'Costo de la matrícula del estudiante',
        example: '150.00',
        type: 'string'
    })
    @IsString()
    @IsDecimal({ decimal_digits: '2' })
    costoMatricula: string;

    @ApiProperty({
        description: 'Fecha de ingreso del estudiante',
        example: '2024-03-01',
        type: 'string',
        format: 'date'
    })
    @IsDateString()
    fechaIngreso: string;

    @ApiProperty({
        description: 'ID del grado al que se matricula el estudiante',
        example: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        format: 'uuid'
    })
    @IsUUID()
    idGrado: string;

    @ApiProperty({
        description: 'Método de pago utilizado para la matrícula',
        example: 'Transferencia bancaria',
        required: false
    })
    @IsOptional()
    @IsEnum(MetodoPago)
    metodoPago?: MetodoPago;

    @ApiProperty({
        description: 'URL o path de la imagen del voucher de pago',
        example: 'https://ejemplo.com/voucher123.jpg',
        required: false
    })
    @IsOptional()
    @IsString()
    voucherImg?: string;

    // OPCIÓN 1: IDs existentes
    @ApiProperty({
        description: 'ID del apoderado responsable de la matrícula (usar si ya existe)',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        format: 'uuid',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idApoderado?: string;

    @ApiProperty({
        description: 'ID del estudiante que se matricula (usar si ya existe)',
        example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        format: 'uuid',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idEstudiante?: string;

    // OPCIÓN 2: Datos para crear nuevos registros
    @ApiProperty({
        description: 'Datos del apoderado (usar si no existe y se quiere crear)',
        required: false,
        type: CreateApoderadoDataDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateApoderadoDataDto)
    apoderadoData?: CreateApoderadoDataDto;

    @ApiProperty({
        description: 'Datos del estudiante (usar si no existe y se quiere crear)',
        required: false,
        type: CreateEstudianteDataDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateEstudianteDataDto)
    estudianteData?: CreateEstudianteDataDto;

    // OPCIÓN 3: Selección/preferencia de aula
    @ApiProperty({
        description: 'ID del aula específica para asignar al estudiante (opcional, si no se proporciona se asigna automáticamente la mejor disponible)',
        example: 'd4e5f6g7-h8i9-0123-def4-56789abc0123',
        format: 'uuid',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idAulaEspecifica?: string;

    @ApiProperty({
        description: 'Tipo de asignación de aula: "automatica" (recomendado) o "manual" (el usuario elige)',
        example: 'automatica',
        enum: ['automatica', 'manual'],
        default: 'automatica',
        required: false
    })
    @IsOptional()
    @IsString()
    tipoAsignacionAula?: 'automatica' | 'manual';

    @ApiProperty({
        description: 'Motivo de la preferencia de aula (opcional, para registro administrativo)',
        example: 'Hermano en la misma sección',
        required: false
    })
    @IsOptional()
    @IsString()
    motivoPreferencia?: string;
}


