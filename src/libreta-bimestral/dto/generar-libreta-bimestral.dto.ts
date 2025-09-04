import { IsUUID, IsNotEmpty } from 'class-validator';

export class GenerarLibretaBimestralDto {
    @IsNotEmpty()
    @IsUUID()
    idEstudiante: string;

    @IsNotEmpty()
    @IsUUID()
    idBimestre: string;

    @IsNotEmpty()
    @IsUUID()
    idAula: string;
}
