import { PartialType } from '@nestjs/swagger';
import { CreateObservacionDocenteDto } from './create-observacion-docente.dto';

export class UpdateObservacionDocenteDto extends PartialType(CreateObservacionDocenteDto) {}
