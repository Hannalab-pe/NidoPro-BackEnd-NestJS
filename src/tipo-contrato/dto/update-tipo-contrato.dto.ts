import { PartialType } from '@nestjs/swagger';
import { CreateTipoContratoDto } from './create-tipo-contrato.dto';

export class UpdateTipoContratoDto extends PartialType(CreateTipoContratoDto) {}
