import { IsString, IsNumber, IsOptional, IsIn, IsUUID, IsDateString, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCajaSimpleDto {
    @IsIn(['INGRESO', 'EGRESO'])
    tipo: string;

    @IsString()
    @MinLength(3)
    @MaxLength(200)
    concepto: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    descripcion?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Type(() => Number)
    @Min(0.01)
    monto: number;

    @IsString()
    @MaxLength(50)
    categoria: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    subcategoria?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    metodoPago?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    comprobante?: string;

    @IsOptional()
    @IsUUID()
    idEstudiante?: string;

    @IsOptional()
    @IsUUID()
    idTrabajadorBeneficiario?: string;

    @IsUUID()
    registradoPor: string;

    @IsOptional()
    @IsIn(['CONFIRMADO', 'PENDIENTE'])
    estado?: string = 'CONFIRMADO';

    @IsOptional()
    @IsDateString()
    fecha?: string;

    // Campos adicionales para trazabilidad
    @IsOptional()
    @IsUUID()
    idPensionRelacionada?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    numeroTransaccion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    referenciaExterna?: string;
}
