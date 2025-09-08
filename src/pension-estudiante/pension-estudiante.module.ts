import { Module } from '@nestjs/common';
import { PensionEstudianteService } from './pension-estudiante.service';
import { PensionEstudianteController } from './pension-estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PensionEstudiante } from './entities/pension-estudiante.entity';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { PeriodoEscolarModule } from 'src/periodo-escolar/periodo-escolar.module';
import { GradoModule } from 'src/grado/grado.module';
import { MatriculaModule } from 'src/matricula/matricula.module';
import { CajaSimpleModule } from 'src/caja-simple/caja-simple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PensionEstudiante]),
    TrabajadorModule,
    PeriodoEscolarModule,
    GradoModule,
    MatriculaModule,
    CajaSimpleModule
  ],
  controllers: [PensionEstudianteController],
  providers: [PensionEstudianteService],
  exports: [PensionEstudianteService]
})
export class PensionEstudianteModule { }
