import { PartialType } from '@nestjs/mapped-types';
import { CreateCajaSimpleDto } from './create-caja-simple.dto';
import { IsOptional, IsIn, IsString, IsUUID, IsDateString } from 'class-validator';

export class UpdateCajaSimpleDto extends PartialType(CreateCajaSimpleDto) {
    @IsOptional()
    @IsIn(['CONFIRMADO', 'PENDIENTE', 'ANULADO'])
    estado?: string;
}

export class AnularCajaSimpleDto {
    @IsUUID()
    anuladoPor: string;

    @IsString()
    motivoAnulacion: string;
}
