import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Rol } from '../rol/entities/rol.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante, Rol]),
    UsuarioModule
  ],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService]
})
export class EstudianteModule { }
