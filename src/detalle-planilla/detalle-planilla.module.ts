import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallePlanillaService } from './detalle-planilla.service';
import { DetallePlanillaController } from './detalle-planilla.controller';
import { DetallePlanilla } from './entities/detalle-planilla.entity';
import { PlanillaMensual } from 'src/planilla-mensual/entities/planilla-mensual.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallePlanilla, PlanillaMensual, Trabajador]),
  ],
  controllers: [DetallePlanillaController],
  providers: [DetallePlanillaService],
  exports: [DetallePlanillaService],
})
export class DetallePlanillaModule {}
