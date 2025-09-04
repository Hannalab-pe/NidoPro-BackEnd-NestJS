import { Module } from '@nestjs/common';
import { ObservacionDocenteService } from './observacion-docente.service';
import { ObservacionDocenteController } from './observacion-docente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservacionDocente } from './entities/observacion-docente.entity';
import { Bimestre } from '../bimestre/entities/bimestre.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObservacionDocente, Bimestre, Trabajador])
  ],
  controllers: [ObservacionDocenteController],
  providers: [ObservacionDocenteService],
  exports: [ObservacionDocenteService]
})
export class ObservacionDocenteModule { }
