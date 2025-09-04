import { Module } from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { TrabajadorController } from './trabajador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';
import { Rol } from '../rol/entities/rol.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trabajador, Rol]),
    UsuarioModule
  ],
  controllers: [TrabajadorController],
  providers: [TrabajadorService],
  exports: [TrabajadorService],
})
export class TrabajadorModule { }
