import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches } from "class-validator";

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Contraseña actual del usuario'
    })
    @IsString()
    contrasenaActual: string;

    @ApiProperty({
        description: 'Nueva contraseña (mínimo 6 caracteres)',
        minLength: 6
    })
    @IsString()
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    })
    nuevaContrasena: string;

    @ApiProperty({
        description: 'Confirmación de la nueva contraseña'
    })
    @IsString()
    confirmarContrasena: string;
}
