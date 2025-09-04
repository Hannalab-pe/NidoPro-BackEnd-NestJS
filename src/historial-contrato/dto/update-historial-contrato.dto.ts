import { PartialType } from '@nestjs/swagger';
import { CreateHistorialContratoDto } from './create-historial-contrato.dto';

export class UpdateHistorialContratoDto extends PartialType(CreateHistorialContratoDto) {}
