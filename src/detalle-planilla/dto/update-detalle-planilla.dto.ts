import { PartialType } from '@nestjs/swagger';
import { CreateDetallePlanillaDto } from './create-detalle-planilla.dto';

export class UpdateDetallePlanillaDto extends PartialType(CreateDetallePlanillaDto) {}
