import { PartialType } from '@nestjs/swagger';
import { CreatePlanificacionDto } from './create-planificacion.dto';

export class UpdatePlanificacionDto extends PartialType(CreatePlanificacionDto) {}
