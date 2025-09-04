import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID, IsString, IsEnum, IsDecimal, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MetodoPago } from 'src/enums/metodo-pago.enum';

export class SearchMatriculaDto {
    // Filtros por fechas
    @ApiProperty({
        description: 'Fecha de inicio para filtrar matrículas (desde)',
        example: '2024-01-01',
        required: false
    })
    @IsOptional()
    @IsDateString()
    fechaIngresoDesde?: string;

    @ApiProperty({
        description: 'Fecha de fin para filtrar matrículas (hasta)',
        example: '2024-12-31',
        required: false
    })
    @IsOptional()
    @IsDateString()
    fechaIngresoHasta?: string;

    // Filtros por relaciones
    @ApiProperty({
        description: 'ID del grado para filtrar matrículas',
        example: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idGrado?: string;

    @ApiProperty({
        description: 'ID del estudiante para filtrar matrículas',
        example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idEstudiante?: string;

    @ApiProperty({
        description: 'DNI del estudiante para filtrar matrículas',
        example: '87654321',
        required: false
    })
    @IsOptional()
    @IsString()
    dniEstudiante?: string;

    @ApiProperty({
        description: 'ID del apoderado para filtrar matrículas',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        required: false
    })
    @IsOptional()
    @IsUUID()
    idApoderado?: string;

    @ApiProperty({
        description: 'DNI del apoderado para filtrar matrículas',
        example: '12345678',
        required: false
    })
    @IsOptional()
    @IsString()
    dniApoderado?: string;

    // Filtros por datos de matrícula
    @ApiProperty({
        description: 'Método de pago para filtrar matrículas',
        enum: MetodoPago,
        required: false
    })
    @IsOptional()
    @IsEnum(MetodoPago)
    metodoPago?: MetodoPago;

    @ApiProperty({
        description: 'Costo mínimo de matrícula',
        example: '100.00',
        required: false
    })
    @IsOptional()
    @IsDecimal({ decimal_digits: '2' })
    costoMinimo?: string;

    @ApiProperty({
        description: 'Costo máximo de matrícula',
        example: '200.00',
        required: false
    })
    @IsOptional()
    @IsDecimal({ decimal_digits: '2' })
    costoMaximo?: string;

    // Filtros de texto para nombres
    @ApiProperty({
        description: 'Nombre del estudiante (búsqueda parcial)',
        example: 'María',
        required: false
    })
    @IsOptional()
    @IsString()
    nombreEstudiante?: string;

    @ApiProperty({
        description: 'Apellido del estudiante (búsqueda parcial)',
        example: 'García',
        required: false
    })
    @IsOptional()
    @IsString()
    apellidoEstudiante?: string;

    @ApiProperty({
        description: 'Nombre del apoderado (búsqueda parcial)',
        example: 'Juan',
        required: false
    })
    @IsOptional()
    @IsString()
    nombreApoderado?: string;

    // Paginación
    @ApiProperty({
        description: 'Página para la paginación',
        example: 1,
        required: false,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Cantidad de registros por página',
        example: 10,
        required: false,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    // Ordenamiento
    @ApiProperty({
        description: 'Campo por el cual ordenar',
        example: 'fechaIngreso',
        enum: ['fechaIngreso', 'costoMatricula', 'nombreEstudiante', 'nombreApoderado'],
        required: false
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'fechaIngreso';

    @ApiProperty({
        description: 'Dirección del ordenamiento',
        example: 'DESC',
        enum: ['ASC', 'DESC'],
        required: false
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}