import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoTrabajadorService } from './contrato-trabajador.service';
import { ContratoTrabajadorController } from './contrato-trabajador.controller';
import { ContratoTrabajador } from './entities/contrato-trabajador.entity';
import { HistorialContratoModule } from '../historial-contrato/historial-contrato.module';
import { RenovacionContratoModule } from '../renovacion-contrato/renovacion-contrato.module';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { SueldoTrabajadorModule } from 'src/sueldo-trabajador/sueldo-trabajador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContratoTrabajador]),
    HistorialContratoModule,
    RenovacionContratoModule,
    forwardRef(() => TrabajadorModule),
    SueldoTrabajadorModule
  ],
  controllers: [ContratoTrabajadorController],
  providers: [ContratoTrabajadorService],
  exports: [ContratoTrabajadorService] // Para que otros módulos puedan usar el service
})
export class ContratoTrabajadorModule { }
