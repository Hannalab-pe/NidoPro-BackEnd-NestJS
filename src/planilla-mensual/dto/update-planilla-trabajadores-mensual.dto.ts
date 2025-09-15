import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdatePlanillaMensualTrabajadorDto {
    @ApiProperty({
        description: 'IDs de los trabajadores a agregar a la planilla',
        example: ['uuid1', 'uuid2', 'uuid3'],
        type: [String],
    })
    @IsArray({ message: 'Los trabajadores deben ser un array' })
    @IsUUID(4, { each: true, message: 'Cada ID de trabajador debe ser un UUID válido' })
    trabajadores: string[];

    @ApiProperty({
        description: 'ID del trabajador que actualiza la planilla',
        example: 'uuid-del-generador',
    })
    @IsUUID(4, { message: 'El ID del generador debe ser un UUID válido' })
    generadoPor: string;
}
