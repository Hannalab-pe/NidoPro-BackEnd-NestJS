import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsInt, Min, Max } from "class-validator";

export class CreateBimestreAutomaticoDto {
    @ApiProperty({
        description: 'Número del bimestre (1-4)',
        example: 1
    })
    @IsInt({ message: 'El número de bimestre debe ser un número entero' })
    @Min(1, { message: 'El número de bimestre debe ser mínimo 1' })
    @Max(4, { message: 'El número de bimestre debe ser máximo 4' })
    numeroBimestre: number;

    @ApiProperty({
        description: 'ID del período escolar',
        example: 'uuid-del-periodo'
    })
    @IsUUID(4, { message: 'El ID del período escolar debe ser un UUID válido' })
    idPeriodoEscolar: string;
}

export class GenerarBimestresAutomaticosDto {
    @ApiProperty({
        description: 'ID del período escolar',
        example: 'uuid-del-periodo'
    })
    @IsUUID(4, { message: 'El ID del período escolar debe ser un UUID válido' })
    idPeriodoEscolar: string;
}
