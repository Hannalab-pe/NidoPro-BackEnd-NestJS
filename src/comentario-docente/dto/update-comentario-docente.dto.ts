import { PartialType } from '@nestjs/swagger';
import { CreateComentarioDocenteDto } from './create-comentario-docente.dto';

export class UpdateComentarioDocenteDto extends PartialType(CreateComentarioDocenteDto) {}
