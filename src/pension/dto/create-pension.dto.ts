import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNumber, IsPositive } from 'class-validator';

export class CreatePensionDto {
    @ApiProperty({ example: 150.50, description: 'Monto de la pensión en soles' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con máximo 2 decimales' })
    @IsPositive({ message: 'El monto debe ser un número positivo' })
    monto: number;
}
