import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsInt, IsDateString, IsBoolean, IsOptional, IsUUID, Min, Max } from "class-validator";

export class CreateBimestreDto {
    @ApiProperty({
        description: 'Número del bimestre (1-4)',
        example: 1
    })
    @IsInt({ message: 'El número de bimestre debe ser un número entero' })
    @Min(1, { message: 'El número de bimestre debe ser mínimo 1' })
    @Max(4, { message: 'El número de bimestre debe ser máximo 4' })
    numeroBimestre: number;

    @ApiProperty({
        description: 'Nombre del bimestre',
        example: 'Primer Bimestre'
    })
    @IsString({ message: 'El nombre del bimestre debe ser un texto' })
    nombreBimestre: string;

    @ApiProperty({
        description: 'Fecha de inicio del bimestre',
        example: '2025-03-01'
    })
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD)' })
    fechaInicio: string;

    @ApiProperty({
        description: 'Fecha de fin del bimestre',
        example: '2025-05-15'
    })
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD)' })
    fechaFin: string;

    @ApiProperty({
        description: 'Fecha límite para programación',
        example: '2025-02-25'
    })
    @IsDateString({}, { message: 'La fecha límite de programación debe ser una fecha válida (YYYY-MM-DD)' })
    fechaLimiteProgramacion: string;

    @ApiProperty({
        description: 'ID del período escolar',
        example: 'uuid-del-periodo'
    })
    @IsUUID(4, { message: 'El ID del período escolar debe ser un UUID válido' })
    idPeriodoEscolar: string;

    @ApiProperty({
        description: 'Estado activo del bimestre',
        example: true,
        required: false
    })
    @IsBoolean({ message: 'El estado debe ser un valor booleano' })
    @IsOptional()
    estaActivo?: boolean;
}