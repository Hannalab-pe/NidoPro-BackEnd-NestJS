import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { CreateLibretaBimestralDto } from './create-libreta-bimestral.dto';

export class UpdateLibretaBimestralDto extends PartialType(CreateLibretaBimestralDto) {
    @ApiProperty({
        example: 'El estudiante ha mejorado su comportamiento y ahora participa más activamente en clase.',
        description: 'Nuevas observaciones sobre la conducta del estudiante',
        required: false
    })
    @IsOptional()
    @IsString()
    observacionesConducta?: string;

    @ApiProperty({
        example: 'B',
        description: 'Nueva calificación de conducta: A (Excelente), B (Bueno), C (Regular)',
        enum: ['A', 'B', 'C'],
        required: false
    })
    @IsOptional()
    @IsString()
    @IsIn(['A', 'B', 'C'], {
        message: 'La conducta debe ser: A (Excelente), B (Bueno), o C (Regular)'
    })
    conducta?: string;
}
