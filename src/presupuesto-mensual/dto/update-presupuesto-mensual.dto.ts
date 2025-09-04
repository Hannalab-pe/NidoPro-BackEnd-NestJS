import { PartialType } from '@nestjs/swagger';
import { CreatePresupuestoMensualDto } from './create-presupuesto-mensual.dto';

export class UpdatePresupuestoMensualDto extends PartialType(CreatePresupuestoMensualDto) {}
