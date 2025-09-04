import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SueldoTrabajadorService } from './sueldo-trabajador.service';
import { SueldoTrabajadorController } from './sueldo-trabajador.controller';
import { SueldoTrabajador } from './entities/sueldo-trabajador.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SueldoTrabajador, Trabajador])],
  controllers: [SueldoTrabajadorController],
  providers: [SueldoTrabajadorService],
  exports: [SueldoTrabajadorService],
})
export class SueldoTrabajadorModule {}
