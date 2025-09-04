import { Module } from '@nestjs/common';
import { ProgramacionMensualService } from './programacion-mensual.service';
import { ProgramacionMensualController } from './programacion-mensual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramacionMensual } from './entities/programacion-mensual.entity';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { AulaModule } from 'src/aula/aula.module';
import { BimestreModule } from 'src/bimestre/bimestre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramacionMensual]),
    BimestreModule,
    TrabajadorModule,
    AulaModule
  ],
  controllers: [ProgramacionMensualController],
  providers: [ProgramacionMensualService],
  exports: [ProgramacionMensualService]
})
export class ProgramacionMensualModule { }
