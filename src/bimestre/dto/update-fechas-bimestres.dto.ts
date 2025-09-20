import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateFechaBimestreDto {
    @ApiProperty({
        description: 'ID del bimestre a actualizar',
        example: 'uuid-del-bimestre'
    })
    @IsUUID(4, { message: 'El ID del bimestre debe ser un UUID válido' })
    id: string;

    @ApiProperty({
        description: 'Nueva fecha de inicio del bimestre',
        example: '2025-03-01'
    })
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD)' })
    fechaInicio: string;

    @ApiProperty({
        description: 'Nueva fecha de fin del bimestre',
        example: '2025-05-15'
    })
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD)' })
    fechaFin: string;

    @ApiProperty({
        description: 'Nueva fecha límite para programación (opcional)',
        example: '2025-02-25',
        required: false
    })
    @IsDateString({}, { message: 'La fecha límite de programación debe ser una fecha válida (YYYY-MM-DD)' })
    @IsOptional()
    fechaLimiteProgramacion?: string;
}

export class UpdateFechasBimestresDto {
    @ApiProperty({
        description: 'Lista de bimestres con sus nuevas fechas',
        type: [UpdateFechaBimestreDto]
    })
    @IsArray({ message: 'Debe proporcionar un arreglo de bimestres' })
    @ValidateNested({ each: true })
    @Type(() => UpdateFechaBimestreDto)
    bimestres: UpdateFechaBimestreDto[];
}