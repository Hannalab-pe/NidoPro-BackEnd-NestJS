import { Module } from '@nestjs/common';
import { NotaService } from './nota.service';
import { NotaController } from './nota.controller';
import { Nota } from './entities/nota.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareaEntregaModule } from 'src/tarea-entrega/tarea-entrega.module';
import { MatriculaAulaModule } from 'src/matricula-aula/matricula-aula.module';

@Module({
  imports: [TypeOrmModule.forFeature([Nota]), TareaEntregaModule,MatriculaAulaModule],
  controllers: [NotaController],
  providers: [NotaService],
})
export class NotaModule { }
