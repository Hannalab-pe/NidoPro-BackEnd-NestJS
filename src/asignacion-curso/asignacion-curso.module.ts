import { Module } from '@nestjs/common';
import { AsignacionCursoService } from './asignacion-curso.service';
import { AsignacionCursoController } from './asignacion-curso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionCurso } from './entities/asignacion-curso.entity';
import { CursoModule } from '../curso/curso.module';
import { TrabajadorModule } from '../trabajador/trabajador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionCurso]),
    CursoModule,
    TrabajadorModule
  ],
  controllers: [AsignacionCursoController],
  providers: [AsignacionCursoService],
  exports: [AsignacionCursoService],
})
export class AsignacionCursoModule { }
