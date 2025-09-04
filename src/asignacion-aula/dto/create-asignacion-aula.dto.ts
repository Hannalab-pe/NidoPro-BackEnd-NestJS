import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";

export class CreateAsignacionAulaDto {
    @ApiProperty({ example: "2024-01-15", description: "Fecha de asignación del aula" })
    @IsDateString()
    @IsOptional()
    fechaAsignacion?: string;

    @ApiProperty({ example: true, description: "Estado activo de la asignación" })
    @IsBoolean()
    @IsOptional()
    estadoActivo?: boolean;

    @ApiProperty({ example: "uuid-aula-id", description: "ID del aula a asignar" })
    @IsString()
    idAula: string;

    @ApiProperty({ example: "uuid-trabajador-id", description: "ID del trabajador a asignar" })
    @IsString()
    idTrabajador: string;
}
