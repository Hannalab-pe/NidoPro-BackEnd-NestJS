import { PartialType } from '@nestjs/swagger';
import { CreateHistorialReporteDto } from './create-historial-reporte.dto';

export class UpdateHistorialReporteDto extends PartialType(CreateHistorialReporteDto) {}
