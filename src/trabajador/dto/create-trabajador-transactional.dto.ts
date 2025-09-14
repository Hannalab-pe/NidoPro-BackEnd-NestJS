import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsBoolean,
    IsUUID,
    IsEnum,
    IsEmail,
    IsDateString,
    IsDecimal,
    IsInt,
    Length,
    Min,
    Max,
    ValidateNested,
    IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDocumento } from '../../enums/tipo-documento.enum';
import { EstadoContratoEnum, JornadaLaboralEnum } from '../../enums/contrato-trabajador.enum';

// DTO para los datos del sueldo base
export class SueldoBaseDto {
    @ApiProperty({
        description: 'Sueldo base del trabajador',
        example: '2500.00',
    })
    @IsDecimal({ decimal_digits: '0,2' })
    sueldoBase: string;

    @ApiPropertyOptional({
        description: 'Bonificación familiar',
        example: '150.00',
    })
    @IsOptional()
    @IsDecimal({ decimal_digits: '0,2' })
    bonificacionFamiliar?: string;

    @ApiPropertyOptional({
        description: 'Asignación familiar',
        example: '100.00',
    })
    @IsOptional()
    @IsDecimal({ decimal_digits: '0,2' })
    asignacionFamiliar?: string;

    @ApiPropertyOptional({
        description: 'Fecha de asignación del sueldo (YYYY-MM-DD)',
        example: '2024-06-01',
    })
    @IsOptional()
    @IsDateString()
    fechaAsignacion?: string;

    @ApiProperty({
        description: 'Fecha de vigencia desde (YYYY-MM-DD)',
        example: '2024-06-01',
    })
    @IsDateString()
    fechaVigenciaDesde: string;

    @ApiPropertyOptional({
        description: 'Fecha de vigencia hasta (YYYY-MM-DD)',
        example: '2025-06-01',
    })
    @IsOptional()
    @IsDateString()
    fechaVigenciaHasta?: string;

    @ApiPropertyOptional({
        description: 'Observaciones sobre el sueldo',
        example: 'Sueldo inicial de contratación',
    })
    @IsOptional()
    @IsString()
    observaciones?: string;

    @ApiPropertyOptional({
        description: 'Estado activo del sueldo',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    estaActivo?: boolean;

    @ApiPropertyOptional({
        description: 'ID del trabajador que crea el sueldo',
        example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    })
    @IsOptional()
    @IsUUID()
    creadoPor?: string;

    @ApiPropertyOptional({
        description: 'ID del trabajador que actualiza el sueldo',
        example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    })
    @IsOptional()
    @IsUUID()
    actualizadoPor?: string;
    
}

// DTO para los datos del contrato
export class ContratoDto {
    @ApiProperty({
        description: 'ID del tipo de contrato',
        example: 'b2c3d4e5-f6a7-8901-bcde-2345678901fa',
    })
    @IsUUID()
    idTipoContrato: string;

    @ApiProperty({
        description: 'Número único del contrato',
        maxLength: 50,
        example: 'CT-2024-001',
    })
    @IsString()
    @Length(1, 50)
    numeroContrato: string;

    @ApiProperty({
        description: 'Fecha de inicio del contrato (YYYY-MM-DD)',
        example: '2024-06-01',
    })
    @IsDateString()
    fechaInicio: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin del contrato (YYYY-MM-DD)',
        example: '2025-06-01',
    })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin del período de prueba (YYYY-MM-DD)',
        example: '2024-09-01',
    })
    @IsOptional()
    @IsDateString()
    fechaFinPeriodoPrueba?: string;

    @ApiProperty({
        description: 'Sueldo contratado',
        example: '3500.00',
    })
    @IsDecimal({ decimal_digits: '2' })
    @IsOptional()
    sueldoContratado: Number;

    @ApiProperty({
        description: 'Tipo de jornada laboral',
        enum: JornadaLaboralEnum,
        example: JornadaLaboralEnum.COMPLETA,
    })
    @IsEnum(JornadaLaboralEnum)
    jornadaLaboral: JornadaLaboralEnum;

    @ApiPropertyOptional({
        description: 'Horas de trabajo por semana',
        minimum: 1,
        maximum: 168,
        example: 40,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(168)
    horasSemanales?: number;

    @ApiProperty({
        description: 'Cargo en el contrato',
        maxLength: 100,
        example: 'Docente de Matemáticas',
    })
    @IsString()
    @Length(1, 100)
    cargoContrato: string;

    @ApiPropertyOptional({
        description: 'Descripción de las funciones del cargo',
        maxLength: 1000,
        example: 'Responsable de impartir clases y evaluar a los estudiantes.',
    })
    @IsOptional()
    @IsString()
    @Length(0, 1000)
    descripcionFunciones?: string;

    @ApiProperty({
        description: 'Lugar de trabajo',
        maxLength: 200,
        example: 'Lima, Oficina Central',
    })
    @IsString()
    @Length(1, 200)
    lugarTrabajo: string;

    @ApiPropertyOptional({
        description: 'Estado del contrato',
        enum: EstadoContratoEnum,
        default: EstadoContratoEnum.ACTIVO,
    })
    @IsOptional()
    @IsEnum(EstadoContratoEnum)
    estadoContrato?: EstadoContratoEnum;

    @ApiPropertyOptional({
        description: 'Motivo de finalización del contrato',
        maxLength: 100,
        example: 'Renuncia voluntaria',
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    motivoFinalizacion?: string;

    @ApiPropertyOptional({
        description: 'Fecha real de finalización (YYYY-MM-DD)',
        example: '2025-06-15',
    })
    @IsOptional()
    @IsDateString()
    fechaFinalizacionReal?: string;

    @ApiPropertyOptional({
        description: 'URL del archivo del contrato',
        example: 'https://documentos.empresa.com/contratos/CT-2024-001.pdf',
    })
    @IsOptional()
    @IsUrl()
    archivoContratoUrl?: string;

    @ApiPropertyOptional({
        description: 'URL del archivo firmado del contrato',
        example: 'https://documentos.empresa.com/contratos/firmados/CT-2024-001-firmado.pdf',
    })
    @IsOptional()
    @IsUrl()
    archivoFirmadoUrl?: string;

    @ApiPropertyOptional({
        description: 'Renovación automática del contrato',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    renovacionAutomatica?: boolean;

    @ApiPropertyOptional({
        description: 'Días de aviso para renovación',
        minimum: 1,
        maximum: 365,
        example: 30,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(365)
    diasAvisoRenovacion?: number;

    @ApiPropertyOptional({
        description: 'Fecha de aprobación del contrato (YYYY-MM-DD)',
        example: '2024-05-30',
    })
    @IsOptional()
    @IsDateString()
    fechaAprobacion?: string;

    @ApiPropertyOptional({
        description: 'Fecha de creacion del contrato (YYYY-MM-DD)',
        example: '2024-05-30',
    })
    @IsOptional()
    @IsDateString()
    creadoEn?: string;
}

// DTO principal para la creación transaccional del trabajador
export class CreateTrabajadorTransactionalDto {

    // Datos del trabajador
    @ApiProperty({
        description: 'ID del trabajador',
        example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    })
    @IsUUID()
    @IsOptional()
    idTrabajador: string;

    // Datos del trabajador
    @ApiProperty({
        description: 'Nombre del trabajador',
        example: 'Juan Carlos',
    })
    @IsString()
    nombre: string;

    @ApiProperty({
        description: 'Apellido del trabajador',
        example: 'González Pérez',
    })
    @IsString()
    apellido: string;

    @ApiProperty({
        enum: TipoDocumento,
        description: 'Tipo de documento del trabajador',
        example: TipoDocumento.DNI,
    })
    @IsEnum(TipoDocumento, {
        message: 'Tipo de documento debe ser uno de los valores válidos',
    })
    tipoDocumento: TipoDocumento;

    @ApiProperty({
        description: 'Número de documento del trabajador',
        example: '12345678',
    })
    @IsString()
    nroDocumento: string;

    @ApiPropertyOptional({
        description: 'Dirección del trabajador',
        example: 'Av. Principal 123, Lima',
    })
    @IsString()
    @IsOptional()
    direccion?: string;

    @ApiPropertyOptional({
        description: 'Correo electrónico del trabajador',
        example: 'juan.gonzalez@email.com',
    })
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @IsOptional()
    correo?: string;

    @ApiPropertyOptional({
        description: 'Teléfono del trabajador',
        example: '987654321',
    })
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiPropertyOptional({
        description: 'Estado activo del trabajador',
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    estaActivo?: boolean;

    @ApiPropertyOptional({
        description: 'URL de la imagen del trabajador',
        example: 'https://images.empresa.com/trabajadores/juan-gonzalez.jpg',
    })
    @IsString()
    @IsOptional()
    imagenUrl?: string;

    @ApiProperty({
        description: 'ID del rol a asignar al trabajador',
        example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    })
    @IsUUID(4, { message: 'ID de rol debe ser un UUID válido' })
    idRol: string;

    // Datos del sueldo base
    @ApiProperty({
        description: 'Información del sueldo base del trabajador',
        type: SueldoBaseDto,
    })
    @ValidateNested()
    @Type(() => SueldoBaseDto)
    sueldoBase: SueldoBaseDto;

    // Datos del contrato
    @ApiProperty({
        description: 'Información del contrato del trabajador',
        type: ContratoDto,
    })
    @ValidateNested()
    @Type(() => ContratoDto)
    contrato: ContratoDto;
}