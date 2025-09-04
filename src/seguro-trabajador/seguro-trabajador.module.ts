import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguroTrabajadorService } from './seguro-trabajador.service';
import { SeguroTrabajadorController } from './seguro-trabajador.controller';
import { SeguroTrabajador } from './entities/seguro-trabajador.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { TipoSeguro } from '../tipo-seguro/entities/tipo-seguro.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeguroTrabajador, Trabajador, TipoSeguro]),
  ],
  controllers: [SeguroTrabajadorController],
  providers: [SeguroTrabajadorService],
  exports: [SeguroTrabajadorService],
})
export class SeguroTrabajadorModule {}
