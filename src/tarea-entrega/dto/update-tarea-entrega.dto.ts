import { PartialType } from '@nestjs/swagger';
import { CreateTareaEntregaDto } from './create-tarea-entrega.dto';

export class UpdateTareaEntregaDto extends PartialType(CreateTareaEntregaDto) {}
