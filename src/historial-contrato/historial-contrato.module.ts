import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialContratoService } from './historial-contrato.service';
import { HistorialContratoController } from './historial-contrato.controller';
import { HistorialContrato } from './entities/historial-contrato.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialContrato])
  ],
  controllers: [HistorialContratoController],
  providers: [HistorialContratoService],
  exports: [HistorialContratoService] // Para que otros módulos puedan usarlo
})
export class HistorialContratoModule { }
