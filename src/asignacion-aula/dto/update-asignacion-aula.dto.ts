import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignacionAulaDto } from './create-asignacion-aula.dto';

export class UpdateAsignacionAulaDto extends PartialType(CreateAsignacionAulaDto) {}
