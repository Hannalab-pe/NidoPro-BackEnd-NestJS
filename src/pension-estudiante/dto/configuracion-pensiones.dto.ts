import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para configurar la generación automática de pensiones por año escolar.
 * Ya no necesita montos porque estos vienen de la relación Grado -> Pension en BD.
 */
export class ConfiguracionPensionesDto {
    @ApiProperty({
        description: 'Año escolar para generar pensiones',
        example: 2024,
        minimum: 2024
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(2024)
    anioEscolar: number;

    @ApiProperty({
        description: 'Día del mes para vencimiento personalizado (1-31). Si no se especifica, se usa el configurado en cada pensión por grado.',
        example: 15,
        required: false,
        minimum: 1,
        maximum: 31
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(31)
    diaVencimientoPersonalizado?: number;

    @ApiProperty({
        description: 'Descripción de la generación de pensiones',
        example: 'Generación automática de pensiones para el año escolar 2024',
        required: false
    })
    @IsOptional()
    descripcion?: string;

    @ApiProperty({
        description: 'Indica si se debe regenerar pensiones existentes (sobrescribir). Por defecto: false',
        default: false,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    regenerarExistentes?: boolean;

    @ApiProperty({
        description: 'Aplicar descuentos por pago adelantado configurados en las pensiones por grado',
        default: false,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    aplicarDescuentosPagoAdelantado?: boolean;
}
