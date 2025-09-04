import { PartialType } from '@nestjs/swagger';
import { CreatePlanillaMensualDto } from './create-planilla-mensual.dto';

export class UpdatePlanillaMensualDto extends PartialType(CreatePlanillaMensualDto) {}
