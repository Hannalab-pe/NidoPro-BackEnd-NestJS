// src/rag/rag.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RAGController } from './rag.controller';
import { RAGService } from './rag.service';
import { EmbeddingService } from './embedding.service';

// Importar las entidades necesarias
import { Usuario } from '../usuario/entities/usuario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Nota } from '../nota/entities/nota.entity';
import { AnotacionesEstudiante } from '../anotaciones-estudiante/entities/anotaciones-estudiante.entity';
import { Asistencia } from '../asistencia/entities/asistencia.entity';

@Module({
  imports: [
    // QUITAR RAGModule de aquí - causa error circular
    TypeOrmModule.forFeature([
      Usuario,
      Estudiante,
      Nota,
      AnotacionesEstudiante,
      Asistencia,
    ]),
  ],
  controllers: [RAGController],
  providers: [RAGService, EmbeddingService],
  exports: [RAGService],
})
export class RAGModule {}