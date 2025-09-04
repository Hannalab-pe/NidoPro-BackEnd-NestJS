import { PartialType } from '@nestjs/swagger';
import { CreateAuditoriaFinancieraDto } from './create-auditoria-financiera.dto';

export class UpdateAuditoriaFinancieraDto extends PartialType(CreateAuditoriaFinancieraDto) {}
