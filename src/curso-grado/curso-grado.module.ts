import { Module } from '@nestjs/common';
import { CursoGradoService } from './curso-grado.service';
import { CursoGradoController } from './curso-grado.controller';
import { CursoGrado } from './entities/curso-grado.entity';
import { CursoModule } from 'src/curso/curso.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradoModule } from 'src/grado/grado.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CursoGrado]),
    CursoModule,                           
    GradoModule                            
  ],
  controllers: [CursoGradoController],
  providers: [CursoGradoService],
  exports: [CursoGradoService]
})
export class CursoGradoModule {}
