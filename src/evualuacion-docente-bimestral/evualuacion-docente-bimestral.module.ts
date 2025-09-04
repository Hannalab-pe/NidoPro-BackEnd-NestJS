import { Module } from '@nestjs/common';
import { EvualuacionDocenteBimestralService } from './evualuacion-docente-bimestral.service';
import { EvualuacionDocenteBimestralController } from './evualuacion-docente-bimestral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionDocenteBimestral } from './entities/evualuacion-docente-bimestral.entity';
import { Bimestre } from '../bimestre/entities/bimestre.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { ObservacionDocenteModule } from '../observacion-docente/observacion-docente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluacionDocenteBimestral, Bimestre, Trabajador]),
    ObservacionDocenteModule
  ],
  controllers: [EvualuacionDocenteBimestralController],
  providers: [EvualuacionDocenteBimestralService],
  exports: [EvualuacionDocenteBimestralService]
})
export class EvualuacionDocenteBimestralModule { }
