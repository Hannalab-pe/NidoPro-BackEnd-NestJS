import { Module, forwardRef } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matricula } from './entities/matricula.entity';
import { EstudianteModule } from 'src/estudiante/estudiante.module';
import { ApoderadoModule } from 'src/apoderado/apoderado.module';
import { GradoModule } from 'src/grado/grado.module';
import { MatriculaAulaModule } from 'src/matricula-aula/matricula-aula.module';
import { AulaModule } from 'src/aula/aula.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matricula]),
    EstudianteModule,
    ApoderadoModule,
    GradoModule,
    forwardRef(() => MatriculaAulaModule),
    AulaModule
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService]
})
export class MatriculaModule { }
