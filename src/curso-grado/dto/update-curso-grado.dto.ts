import { PartialType } from '@nestjs/swagger';
import { CreateCursoGradoDto } from './create-curso-grado.dto';

export class UpdateCursoGradoDto extends PartialType(CreateCursoGradoDto) {}
