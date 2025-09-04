import { Module } from '@nestjs/common';
import { PresupuestoMensualService } from './presupuesto-mensual.service';
import { PresupuestoMensualController } from './presupuesto-mensual.controller';

@Module({
  controllers: [PresupuestoMensualController],
  providers: [PresupuestoMensualService],
})
export class PresupuestoMensualModule {}
