import { PartialType } from '@nestjs/swagger';
import { CreateReporteProgramadorDto } from './create-reporte-programador.dto';

export class UpdateReporteProgramadorDto extends PartialType(CreateReporteProgramadorDto) {}
