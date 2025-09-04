import { PartialType } from '@nestjs/swagger';
import { CreateTipoSeguroDto } from './create-tipo-seguro.dto';

export class UpdateTipoSeguroDto extends PartialType(CreateTipoSeguroDto) {}
