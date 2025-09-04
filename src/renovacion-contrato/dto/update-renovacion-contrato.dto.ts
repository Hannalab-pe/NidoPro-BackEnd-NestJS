import { PartialType } from '@nestjs/swagger';
import { CreateRenovacionContratoDto } from './create-renovacion-contrato.dto';

export class UpdateRenovacionContratoDto extends PartialType(CreateRenovacionContratoDto) {}
