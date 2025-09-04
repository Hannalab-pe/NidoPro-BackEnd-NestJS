import { PartialType } from '@nestjs/swagger';
import { CreateGastoOperativoDto } from './create-gasto-operativo.dto';

export class UpdateGastoOperativoDto extends PartialType(CreateGastoOperativoDto) {}
