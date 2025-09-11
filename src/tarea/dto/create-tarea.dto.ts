import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  IsIn,
} from 'class-validator';

export class CreateTareaDto {
  @ApiProperty({
    example: 'Ensayo sobre el calentamiento global',
    description: 'Título de la tarea',
    maxLength: 200,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(1, 200, { message: 'El título debe tener entre 1 y 200 caracteres' })
  titulo: string;

  @ApiProperty({
    example:
      'Escribir un ensayo de 500 palabras sobre las causas y consecuencias del calentamiento global...',
    description: 'Descripción detallada de la tarea',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    example: '2024-12-30',
    description: 'Fecha límite de entrega (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
  fechaEntrega: string;

  @ApiProperty({
    example: 'pendiente',
    description: 'Estado de la tarea',
    enum: ['pendiente', 'activa', 'cerrada'],
    required: false,
    default: 'pendiente',
  })
  @IsOptional()
  @IsIn(['pendiente', 'activa', 'cerrada'], {
    message: 'El estado debe ser: pendiente, activa o cerrada',
  })
  estado?: string;

  @ApiProperty({
    example: 'https://example.com/archivo.pdf',
    description: 'URL del archivo asociado a la tarea',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL del archivo debe ser una cadena de texto' })
  archivoUrl?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del aula donde se asigna la tarea',
  })
  @IsUUID(4, { message: 'El ID del aula debe ser un UUID válido' })
  idAula: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del trabajador (profesor) que asigna la tarea',
  })
  @IsUUID(4, { message: 'El ID del trabajador debe ser un UUID válido' })
  idTrabajador: string;
}
