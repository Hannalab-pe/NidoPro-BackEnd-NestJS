import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateContratoTrabajadorDto } from './create-contrato-trabajador.dto';
import { IsOptional, IsString, Length, IsDateString } from 'class-validator';

export class UpdateContratoTrabajadorDto extends PartialType(CreateContratoTrabajadorDto) {

    @ApiPropertyOptional({ description: 'Motivo de finalización del contrato', maxLength: 100 })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    motivoFinalizacion?: string;

    @ApiPropertyOptional({ description: 'Fecha real de finalización (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    fechaFinalizacionReal?: string;
    
}
