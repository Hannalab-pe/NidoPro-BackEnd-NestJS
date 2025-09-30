import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryNotaDto {
    @ApiProperty({
        example: 'NUMERICO',
        description: 'Tipo de visualización de las notas: NUMERICO (0-20) o LITERAL (AD, A, B, C)',
        enum: ['NUMERICO', 'LITERAL'],
        required: false
    })
    @IsOptional()
    @IsString()
    @IsIn(['NUMERICO', 'LITERAL'], {
        message: 'El tipo debe ser NUMERICO o LITERAL'
    })
    tipo?: 'NUMERICO' | 'LITERAL';
}