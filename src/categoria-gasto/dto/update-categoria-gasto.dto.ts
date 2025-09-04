import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaGastoDto } from './create-categoria-gasto.dto';

export class UpdateCategoriaGastoDto extends PartialType(CreateCategoriaGastoDto) {}
