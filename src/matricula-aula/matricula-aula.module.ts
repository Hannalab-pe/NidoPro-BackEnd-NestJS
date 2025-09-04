import { Module, forwardRef } from '@nestjs/common';
import { MatriculaAulaService } from './matricula-aula.service';
import { MatriculaAulaController } from './matricula-aula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaAula } from './entities/matricula-aula.entity';
import { AulaModule } from 'src/aula/aula.module';
import { MatriculaModule } from 'src/matricula/matricula.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatriculaAula]),
    AulaModule,
    forwardRef(() => MatriculaModule)
  ],
  controllers: [MatriculaAulaController],
  providers: [MatriculaAulaService],
  exports: [MatriculaAulaService]
})
export class MatriculaAulaModule { }
