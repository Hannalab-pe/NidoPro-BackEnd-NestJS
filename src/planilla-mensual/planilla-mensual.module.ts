import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanillaMensualService } from './planilla-mensual.service';
import { PlanillaMensualController } from './planilla-mensual.controller';
import { PlanillaMensual } from './entities/planilla-mensual.entity';
import { DetallePlanilla } from 'src/detalle-planilla/entities/detalle-planilla.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { SueldoTrabajador } from 'src/sueldo-trabajador/entities/sueldo-trabajador.entity';
import { DetallePlanillaModule } from 'src/detalle-planilla/detalle-planilla.module';
import { SueldoTrabajadorModule } from 'src/sueldo-trabajador/sueldo-trabajador.module';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { CajaSimpleModule } from 'src/caja-simple/caja-simple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanillaMensual,
      DetallePlanilla,
      Trabajador,
      SueldoTrabajador,
    ]),
    DetallePlanillaModule,
    SueldoTrabajadorModule,
    TrabajadorModule,
    CajaSimpleModule,
  ],
  controllers: [PlanillaMensualController],
  providers: [PlanillaMensualService],
  exports: [PlanillaMensualService],
})
export class PlanillaMensualModule { }
