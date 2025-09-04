import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID, IsEnum } from "class-validator";
import { TipoDocumento } from "../../enums/tipo-documento.enum";

export class CreateEstudianteDto {
    @ApiProperty()
    @IsString()
    nombre: string;

    @ApiProperty()
    @IsString()
    apellido: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    contactoEmergencia?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    nroEmergencia?: string;

    @ApiProperty({
        enum: TipoDocumento,
        description: 'Tipo de documento',
        required: false
    })
    @IsEnum(TipoDocumento, { message: 'Tipo de documento debe ser uno de los valores válidos' })
    @IsOptional()
    tipoDocumento?: TipoDocumento;

    @ApiProperty({
        description: 'Número de documento (requerido para crear usuario)'
    })
    @IsString()
    nroDocumento: string; // Ya no es opcional, es requerido

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    observaciones?: string;

    @ApiProperty({
        description: 'ID del rol a asignar al estudiante'
    })
    @IsUUID(4, { message: 'ID de rol debe ser un UUID válido' })
    idRol: string;
}
