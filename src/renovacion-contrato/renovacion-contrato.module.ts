import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenovacionContratoService } from './renovacion-contrato.service';
import { RenovacionContratoController } from './renovacion-contrato.controller';
import { RenovacionContrato } from './entities/renovacion-contrato.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RenovacionContrato])
  ],
  controllers: [RenovacionContratoController],
  providers: [RenovacionContratoService],
  exports: [RenovacionContratoService] // Para que otros módulos puedan usarlo
})
export class RenovacionContratoModule { }
