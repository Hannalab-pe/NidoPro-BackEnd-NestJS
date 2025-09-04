import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateUsuarioDto {
    @ApiProperty()
    @IsString()
    usuario: string;

    @ApiProperty()
    @IsString()
    contrasena: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    estaActivo: boolean;
}
