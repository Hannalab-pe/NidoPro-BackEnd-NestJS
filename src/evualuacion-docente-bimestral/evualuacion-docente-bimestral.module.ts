import { Module } from '@nestjs/common';
import { EvualuacionDocenteBimestralService } from './evualuacion-docente-bimestral.service';
import { EvualuacionDocenteBimestralController } from './evualuacion-docente-bimestral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionDocenteBimestral } from './entities/evualuacion-docente-bimestral.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { ObservacionDocenteModule } from '../observacion-docente/observacion-docente.module';
import { BimestreModule } from 'src/bimestre/bimestre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluacionDocenteBimestral, Trabajador]),
    ObservacionDocenteModule,
    BimestreModule
  ],
  controllers: [EvualuacionDocenteBimestralController],
  providers: [EvualuacionDocenteBimestralService],
  exports: [EvualuacionDocenteBimestralService]
})
export class EvualuacionDocenteBimestralModule { }
