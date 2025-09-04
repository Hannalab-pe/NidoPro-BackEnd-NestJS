import { Module } from '@nestjs/common';
import { AsignacionAulaService } from './asignacion-aula.service';
import { AsignacionAulaController } from './asignacion-aula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionAula } from './entities/asignacion-aula.entity';
import { AulaModule } from '../aula/aula.module';
import { TrabajadorModule } from '../trabajador/trabajador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionAula]),
    AulaModule,
    TrabajadorModule
  ],
  controllers: [AsignacionAulaController],
  providers: [AsignacionAulaService],
  exports: [AsignacionAulaService],
})
export class AsignacionAulaModule { }
