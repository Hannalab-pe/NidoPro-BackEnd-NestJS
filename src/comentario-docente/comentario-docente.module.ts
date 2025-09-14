import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentarioDocenteService } from './comentario-docente.service';
import { ComentarioDocenteController } from './comentario-docente.controller';
import { ComentarioDocente } from './entities/comentario-docente.entity';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComentarioDocente]),
    TrabajadorModule,
  ],
  controllers: [ComentarioDocenteController],
  providers: [ComentarioDocenteService],
  exports: [ComentarioDocenteService],
})
export class ComentarioDocenteModule {}
