import { IsString, IsOptional, IsIn, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CreateCategoriaSimpleDto {
    @IsString()
    @MinLength(2)
    @MaxLength(10)
    codigo: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    nombre: string;

    @IsIn(['INGRESO', 'EGRESO', 'AMBOS'])
    tipo: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    esFrecuente?: boolean = false;

    @IsOptional()
    @IsBoolean()
    estaActivo?: boolean = true;

    @IsOptional()
    @IsNumber()
    ordenDisplay?: number = 0;
}
