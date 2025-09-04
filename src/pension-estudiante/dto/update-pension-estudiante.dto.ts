import { PartialType } from '@nestjs/swagger';
import { CreatePensionEstudianteDto } from './create-pension-estudiante.dto';

export class UpdatePensionEstudianteDto extends PartialType(CreatePensionEstudianteDto) {}
