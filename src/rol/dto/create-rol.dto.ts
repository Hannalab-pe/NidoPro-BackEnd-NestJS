import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateRolDto {
    @ApiProperty({ example: "Docente" })
    @IsString()
    nombre: string;

    @ApiProperty({ example: "Rol de docente en el sistema" })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    estaActivo: boolean;
}
