import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoTrabajadorService } from './contrato-trabajador.service';
import { ContratoTrabajadorController } from './contrato-trabajador.controller';
import { ContratoTrabajador } from './entities/contrato-trabajador.entity';
import { HistorialContratoModule } from '../historial-contrato/historial-contrato.module';
import { RenovacionContratoModule } from '../renovacion-contrato/renovacion-contrato.module';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContratoTrabajador]),
    HistorialContratoModule, 
    RenovacionContratoModule,
    TrabajadorModule
  ],
  controllers: [ContratoTrabajadorController],
  providers: [ContratoTrabajadorService],
  exports: [ContratoTrabajadorService] // Para que otros módulos puedan usar el service
})
export class ContratoTrabajadorModule { }
