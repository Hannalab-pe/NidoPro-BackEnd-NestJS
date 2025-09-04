import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInformeDto {
    @ApiProperty({
        example: 'El estudiante mostró un comportamiento ejemplar durante la clase de matemáticas. Participó activamente y ayudó a sus compañeros con las tareas.',
        description: 'Detalle completo del informe sobre el estudiante'
    })
    @IsString()
    detalleInforme: string;

    @ApiProperty({
        example: '2024-12-15',
        description: 'Fecha de registro del informe (YYYY-MM-DD). Si no se proporciona, se usa la fecha actual',
        required: false
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
    fechaRegistro?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del estudiante sobre quien se hace el informe' })
    @IsUUID()
    idEstudiante: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del trabajador/profesor que elabora el informe' })
    @IsUUID()
    idTrabajador: string;
}
