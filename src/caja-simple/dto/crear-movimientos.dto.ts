import { IsString, IsNumber, IsOptional, IsUUID, Min, MaxLength } from 'class-validator';

export class CrearIngresoPorPensionDto {
    @IsUUID()
    idEstudiante: string;

    @IsUUID()
    idPensionRelacionada: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto: number;

    @IsString()
    @MaxLength(50)
    metodoPago: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;

    @IsUUID()
    registradoPor: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    observaciones?: string;
}

export class CrearIngresoPorMatriculaDto {
    @IsUUID()
    idEstudiante: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto: number;

    @IsString()
    @MaxLength(50)
    metodoPago: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;

    @IsUUID()
    registradoPor: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    periodoEscolar?: string;
}

export class CrearEgresoPorPlanillaDto {
    @IsUUID()
    idTrabajadorBeneficiario: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto: number;

    @IsNumber()
    @Min(1)
    mes: number;

    @IsNumber()
    @Min(2020)
    anio: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    conceptoDetalle?: string;

    @IsUUID()
    registradoPor: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numeroComprobante?: string;
}
