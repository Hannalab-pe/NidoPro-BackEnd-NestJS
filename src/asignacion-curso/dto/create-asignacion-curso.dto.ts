import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsDateString, IsUUID } from "class-validator";

export class CreateAsignacionCursoDto {
    @ApiProperty({
        example: "2024-01-15",
        description: "Fecha de asignación del curso (opcional, por defecto hoy)",
        required: false
    })
    @IsDateString()
    @IsOptional()
    fechaAsignacion?: string;

    @ApiProperty({
        example: true,
        description: "Estado activo de la asignación (opcional, por defecto true)",
        required: false
    })
    @IsBoolean()
    @IsOptional()
    estaActivo?: boolean;

    @ApiProperty({
        example: "uuid-curso-id",
        description: "ID del curso a asignar"
    })
    @IsUUID()
    idCurso: string;

    @ApiProperty({
        example: "uuid-trabajador-id",
        description: "ID del trabajador/profesor a asignar"
    })
    @IsUUID()
    idTrabajador: string;
}
