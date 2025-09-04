import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterPensionDto {
    @ApiProperty({ description: 'ID del estudiante para filtrar', required: false })
    @IsOptional()
    @IsUUID()
    idEstudiante?: string;

    @ApiProperty({
        description: 'Estado de la pensión',
        enum: ['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'],
        required: false
    })
    @IsOptional()
    @IsString()
    @IsIn(['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'])
    estadoPension?: string;

    @ApiProperty({ description: 'Año para filtrar', required: false })
    @IsOptional()
    anio?: number;

    @ApiProperty({ description: 'Mes para filtrar', required: false })
    @IsOptional()
    mes?: number;
}
