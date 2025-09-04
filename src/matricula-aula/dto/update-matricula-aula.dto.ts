import { PartialType } from '@nestjs/swagger';
import { CreateMatriculaAulaDto } from './create-matricula-aula.dto';

export class UpdateMatriculaAulaDto extends PartialType(CreateMatriculaAulaDto) {}
