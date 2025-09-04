import { PartialType } from '@nestjs/swagger';
import { CreateAnotacionesEstudianteDto } from './create-anotaciones-estudiante.dto';

export class UpdateAnotacionesEstudianteDto extends PartialType(CreateAnotacionesEstudianteDto) {}
