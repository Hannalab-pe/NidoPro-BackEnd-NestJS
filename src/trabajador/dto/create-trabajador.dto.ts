import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum, IsEmail } from "class-validator";
import { UserRole } from "../../enums/roles.enum";
import { TipoDocumento } from "../../enums/tipo-documento.enum";

export class CreateTrabajadorDto {
    @ApiProperty()
    @IsString()
    nombre: string;

    @ApiProperty()
    @IsString()
    apellido: string;

    @ApiProperty({
        enum: TipoDocumento,
        description: 'Tipo de documento'
    })
    @IsEnum(TipoDocumento, { message: 'Tipo de documento debe ser uno de los valores válidos' })
    tipoDocumento: TipoDocumento;

    @ApiProperty()
    @IsString()
    nroDocumento: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    direccion?: string;

    @ApiProperty({ required: false })
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @IsOptional()
    correo?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiProperty({ default: true, required: false })
    @IsBoolean()
    @IsOptional()
    estaActivo: boolean;

    @ApiProperty({
        description: 'ID del rol a asignar al trabajador'
    })
    @IsUUID(4, { message: 'ID de rol debe ser un UUID válido' })
    idRol: string;
}
