import { Module } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { TareaController } from './tarea.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarea } from './entities/tarea.entity';
import { TareaEntrega } from '../tarea-entrega/entities/tarea-entrega.entity';
import { MatriculaAulaModule } from 'src/matricula-aula/matricula-aula.module';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';
import { AulaModule } from 'src/aula/aula.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tarea, TareaEntrega]),
    MatriculaAulaModule,
    TrabajadorModule,
    AulaModule,
  ],
  controllers: [TareaController],
  providers: [TareaService],
  exports: [TareaService],
})
export class TareaModule {}
