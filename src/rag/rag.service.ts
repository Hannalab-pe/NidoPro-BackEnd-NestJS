// src/rag/rag.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingService } from './embedding.service';

// Entidades
import { Usuario } from '../usuario/entities/usuario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Nota } from '../nota/entities/nota.entity';
import { AnotacionesEstudiante } from '../anotaciones-estudiante/entities/anotaciones-estudiante.entity';
import { Asistencia } from '../asistencia/entities/asistencia.entity';

@Injectable()
export class RAGService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    
    @InjectRepository(Nota)
    private notaRepository: Repository<Nota>,
    
    @InjectRepository(AnotacionesEstudiante)
    private anotacionesRepository: Repository<AnotacionesEstudiante>,
    
    @InjectRepository(Asistencia)
    private asistenciaRepository: Repository<Asistencia>,
    
    private embeddingService: EmbeddingService,
  ) {}

  // Función principal del chatbot
  async chatWithContext(message: string, userId: string): Promise<string> {
    try {
      // 1. Obtener contexto del usuario (padre -> hijos)
      const userContext = await this.getUserContext(userId);
      
      // 2. Buscar información relevante
      const relevantData = await this.searchRelevantInfo(message, userContext);
      
      // 3. Por ahora devolvemos la información sin LLM
      return this.formatResponse(relevantData, userContext);
    } catch (error) {
      return 'Lo siento, hubo un error procesando tu consulta.';
    }
  }

  // src/rag/rag.service.ts - AJUSTE PARA KINDER
  // src/rag/rag.service.ts
    private async getUserContext(userId: string) {
    console.log('🔍 Buscando estudiante con userId:', userId);
    
    // Intentar con ambas propiedades
    const estudiante1 = await this.estudianteRepository.findOne({
        where: { id_Usuario: userId },
        select: ['idEstudiante', 'nombre', 'apellido']
    });
    
    console.log('📊 Resultado con id_Usuario:', estudiante1);
    
    // También intentar usando createQueryBuilder para más control
    const estudiante2 = await this.estudianteRepository
        .createQueryBuilder('estudiante')
        .where('estudiante.id_usuario = :userId', { userId })
        .select(['estudiante.idEstudiante', 'estudiante.nombre', 'estudiante.apellido'])
        .getOne();
        
    console.log('📊 Resultado con QueryBuilder:', estudiante2);

    const estudiante = estudiante1 || estudiante2;

    if (!estudiante) {
        console.log('❌ No se encontró estudiante');
        return {
        userId,
        role: 'no_estudiante',
        children: [],
        childrenIds: [],
        childrenNames: []
        };
    }

    console.log('✅ Estudiante encontrado:', estudiante);
    
    return {
        userId,
        role: 'padre',
        children: [estudiante],
        childrenIds: [estudiante.idEstudiante],
        childrenNames: [`${estudiante.nombre} ${estudiante.apellido}`]
    };
    }

  private async searchRelevantInfo(message: string, userContext: any) {
    if (userContext.role !== 'padre' || userContext.childrenIds.length === 0) {
      return { error: 'No se encontraron estudiantes asociados a tu cuenta.' };
    }

    // ESPECIFICAR TIPOS EXPLÍCITAMENTE
    const data: {
      notas: Nota[];
      anotaciones: AnotacionesEstudiante[];
      asistencias: Asistencia[];
    } = {
      notas: [],
      anotaciones: [],
      asistencias: []
    };

    // Buscar notas recientes (últimas 10)
    data.notas = await this.notaRepository
      .createQueryBuilder('nota')
      .leftJoinAndSelect('nota.idEstudiante2', 'estudiante')
      .where('estudiante.idEstudiante IN (:...ids)', { ids: userContext.childrenIds })
      .orderBy('nota.idNota', 'DESC')
      .limit(10)
      .getMany();

    // Buscar anotaciones recientes (últimas 5)
    data.anotaciones = await this.anotacionesRepository
      .createQueryBuilder('anotacion')
      .leftJoinAndSelect('anotacion.estudiante', 'estudiante')
      .where('estudiante.idEstudiante IN (:...ids)', { ids: userContext.childrenIds })
      .andWhere('anotacion.estaActivo = :activo', { activo: true })
      .orderBy('anotacion.fechaObservacion', 'DESC')
      .limit(5)
      .getMany();

    return data;
  }

  private formatResponse(data: any, userContext: any): string {
    if (data.error) return data.error;

    const childrenNames = userContext.childrenNames.join(', ');
    let response = `Información de ${childrenNames}:\n\n`;

    // Notas
    if (data.notas.length > 0) {
      response += "📚 **Notas recientes:**\n";
      data.notas.forEach(nota => {
        const studentName = `${nota.idEstudiante2.nombre} ${nota.idEstudiante2.apellido}`;
        response += `- ${studentName}: ${nota.puntaje} puntos`;
        if (nota.observaciones) {
          response += ` (${nota.observaciones})`;
        }
        response += '\n';
      });
      response += '\n';
    }

    // Anotaciones
    if (data.anotaciones.length > 0) {
      response += "📝 **Observaciones del docente:**\n";
      data.anotaciones.forEach(anotacion => {
        const studentName = `${anotacion.estudiante.nombre} ${anotacion.estudiante.apellido}`;
        response += `- ${studentName}: ${anotacion.titulo}`;
        if (anotacion.observacion) {
          response += ` - ${anotacion.observacion}`;
        }
        response += ` (${anotacion.fechaObservacion})\n`;
      });
    }

    return response || 'No se encontró información reciente para tus hijos.';
  }
}