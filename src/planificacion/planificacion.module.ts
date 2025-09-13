import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanificacionService } from './planificacion.service';
import { PlanificacionController } from './planificacion.controller';
import { Planificacion } from './entities/planificacion.entity';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { AulaModule } from 'src/aula/aula.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Planificacion]),
    TrabajadorModule,
    AulaModule,
  ],
  controllers: [PlanificacionController],
  providers: [PlanificacionService],
  exports: [PlanificacionService],
})
export class PlanificacionModule {}
