import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDecimal,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateTipoSeguroDto {
  @ApiProperty({
    description: 'Nombre del tipo de seguro',
    example: 'ESSALUD',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreSeguro: string;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de seguro',
    example: 'Seguro de salud obligatorio',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Porcentaje de descuento del seguro',
    example: '9.00',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  porcentajeDescuento: string;

  @ApiPropertyOptional({
    description: 'Monto fijo del seguro',
    example: '50.00',
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  montoFijo?: string;

  @ApiPropertyOptional({
    description: 'Indica si el seguro es obligatorio',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  esObligatorio?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el tipo de seguro está activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de cálculo del seguro',
    example: 'PORCENTAJE',
    enum: ['PORCENTAJE', 'MONTO_FIJO', 'MIXTO'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['PORCENTAJE', 'MONTO_FIJO', 'MIXTO'])
  tipoCalculo?: string;
}
