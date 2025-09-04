import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsString()
    usuario: string;

    @ApiProperty()
    @IsString()
    contrasena: string;
}
