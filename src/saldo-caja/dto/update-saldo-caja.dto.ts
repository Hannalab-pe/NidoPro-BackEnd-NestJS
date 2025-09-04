import { PartialType } from '@nestjs/swagger';
import { CreateSaldoCajaDto } from './create-saldo-caja.dto';

export class UpdateSaldoCajaDto extends PartialType(CreateSaldoCajaDto) {}
