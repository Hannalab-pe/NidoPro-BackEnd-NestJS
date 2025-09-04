import { IsNotEmpty, IsNumber, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfiguracionPensionesDto {
    @ApiProperty({ description: 'Año escolar para generar pensiones' })
    @IsNotEmpty()
    @IsNumber()
    anioEscolar: number;

    @ApiProperty({ description: 'Monto base de la pensión' })
    @IsNotEmpty()
    @IsNumber()
    montoBase: number;

    @ApiProperty({
        description: 'Montos específicos por grado',
        example: { 'inicial-3': 300, 'inicial-4': 320, 'inicial-5': 350 }
    })
    @IsOptional()
    @IsObject()
    montoPorGrado?: { [grado: string]: number };

    @ApiProperty({
        description: 'Meses del año escolar (1-12)',
        example: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    })
    @IsOptional()
    @IsArray()
    mesesEscolares?: number[];

    @ApiProperty({
        description: 'Día del mes para vencimiento (1-31)',
        default: 15
    })
    @IsOptional()
    @IsNumber()
    diaVencimiento?: number;

    @ApiProperty({
        description: 'Descripción de la configuración',
        required: false
    })
    @IsOptional()
    descripcion?: string;
}
