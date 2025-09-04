import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnotacionesEstudianteService } from './anotaciones-estudiante.service';
import { AnotacionesEstudianteController } from './anotaciones-estudiante.controller';
import { AnotacionesEstudiante } from './entities/anotaciones-estudiante.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity';
import { Curso } from 'src/curso/entities/curso.entity';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { CursoModule } from 'src/curso/curso.module';
import { EstudianteModule } from 'src/estudiante/estudiante.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnotacionesEstudiante,
    ]),
    TrabajadorModule,
    EstudianteModule,
    CursoModule,
  ],
  controllers: [AnotacionesEstudianteController],
  providers: [AnotacionesEstudianteService],
  exports: [AnotacionesEstudianteService],
})
export class AnotacionesEstudianteModule { }
