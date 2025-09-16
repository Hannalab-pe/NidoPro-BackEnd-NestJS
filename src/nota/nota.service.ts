import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotaDto, CreateNotaTareaDto, CreateNotaKinderDto, CreateNotaTareaKinderDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Nota } from './entities/nota.entity';
import { DataSource, Repository } from 'typeorm';
import { TareaEntregaService } from 'src/tarea-entrega/tarea-entrega.service';
import { TareaEntrega } from 'src/tarea-entrega/entities/tarea-entrega.entity';
import { MatriculaAulaService } from 'src/matricula-aula/matricula-aula.service';

@Injectable()
export class NotaService {

  constructor(
    @InjectRepository(Nota) private readonly notaRepository: Repository<Nota>,
    private readonly dataSource: DataSource,
    private readonly tareaEntregaService: TareaEntregaService,
    private readonly matriculaAulaService: MatriculaAulaService
  ) { }

  // Funciones helper para conversión entre calificaciones literales y numéricas
  private calificacionLiteralANumero(calificacion: string): number {
    const conversiones = {
      'AD': 19, // Logro destacado (18-20)
      'A': 15,  // Logro esperado (14-17)
      'B': 12,  // En proceso (11-13)
      'C': 8    // En inicio (0-10)
    };
    return conversiones[calificacion] || 0;
  }

  private numeroACalificacionLiteral(puntaje: number): { calificacion: string, descripcion: string } {
    if (puntaje >= 18) return { calificacion: 'AD', descripcion: 'Logro destacado' };
    if (puntaje >= 14) return { calificacion: 'A', descripcion: 'Logro esperado' };
    if (puntaje >= 11) return { calificacion: 'B', descripcion: 'En proceso' };
    return { calificacion: 'C', descripcion: 'En inicio' };
  }

  // Método para registrar nota de evaluación con calificación literal
  async createKinder(createNotaKinderDto: CreateNotaKinderDto): Promise<any> {
    // Verificar que no existe una nota previa para esta evaluación-estudiante
    const notaExistente = await this.notaRepository.findOne({
      where: {
        idEvaluacion: createNotaKinderDto.idEvaluacion,
        idEstudiante: createNotaKinderDto.idEstudiante
      }
    });

    if (notaExistente) {
      throw new BadRequestException("Ya existe una nota para esta evaluación y estudiante");
    }

    // Convertir calificación literal a puntaje numérico para almacenar
    const puntajeNumerico = this.calificacionLiteralANumero(createNotaKinderDto.calificacion);

    const notaData = {
      puntaje: puntajeNumerico.toString(),
      estaAprobado: ['AD', 'A', 'B'].includes(createNotaKinderDto.calificacion),
      observaciones: createNotaKinderDto.observaciones,
      idEvaluacion: createNotaKinderDto.idEvaluacion,
      idEstudiante: createNotaKinderDto.idEstudiante,
      idEvaluacion2: { idEvaluacion: createNotaKinderDto.idEvaluacion },
      idEstudiante2: { idEstudiante: createNotaKinderDto.idEstudiante }
    };

    const nota = this.notaRepository.create(notaData);
    const notaGuardada = await this.notaRepository.save(nota);

    // Cargar nota completa con relaciones
    const notaCompleta = await this.notaRepository.findOne({
      where: { idNota: notaGuardada.idNota },
      relations: ['idEstudiante2', 'idEvaluacion2', 'idEvaluacion2.idCurso']
    });

    return {
      success: true,
      message: 'Nota registrada exitosamente',
      nota: {
        ...notaCompleta,
        calificacionLiteral: createNotaKinderDto.calificacion,
        descripcionCalificacion: this.numeroACalificacionLiteral(puntajeNumerico).descripcion
      }
    };
  }

  // Método para calificar tarea con calificación literal
  async calificarTareaKinder(createNotaTareaKinderDto: CreateNotaTareaKinderDto): Promise<any> {
    return await this.dataSource.transaction(async manager => {

      // 1. Verificar que la tarea entrega existe y está entregada
      const entregaEncontrada = await this.tareaEntregaService.findByEstudianteTarea(
        createNotaTareaKinderDto.idEstudiante,
        createNotaTareaKinderDto.idTarea
      );

      if (!entregaEncontrada) {
        throw new NotFoundException("No se encontró la entrega de la tarea");
      }

      if (!entregaEncontrada.realizoTarea) {
        throw new BadRequestException("No se puede calificar una tarea que no fue realizada");
      }

      // 2. Verificar que no existe una nota previa para esta tarea-estudiante
      const notaExistente = await manager.findOne(Nota, {
        where: {
          idTareaColumn: createNotaTareaKinderDto.idTarea,
          idEstudiante: createNotaTareaKinderDto.idEstudiante
        }
      });

      if (notaExistente) {
        throw new BadRequestException("Esta tarea ya tiene una calificación asignada");
      }

      // 3. Convertir calificación literal a puntaje numérico
      const puntajeNumerico = this.calificacionLiteralANumero(createNotaTareaKinderDto.calificacion);

      // 4. Crear la nota
      const nota = manager.create(Nota, {
        puntaje: puntajeNumerico.toString(),
        estaAprobado: ['AD', 'A', 'B'].includes(createNotaTareaKinderDto.calificacion),
        observaciones: createNotaTareaKinderDto.observaciones || null,
        idEstudiante: createNotaTareaKinderDto.idEstudiante,
        idTareaColumn: createNotaTareaKinderDto.idTarea,
        idEvaluacion: null // Para tareas no hay evaluación
      });

      const notaGuardada = await manager.save(Nota, nota);

      // 5. Actualizar estado de la entrega a 'revisado'
      entregaEncontrada.estado = 'revisado';
      await manager.save(TareaEntrega, entregaEncontrada);

      // 6. Cargar nota completa con relaciones
      const notaCompleta = await manager.findOne(Nota, {
        where: { idNota: notaGuardada.idNota },
        relations: ['idEstudiante2', 'idTarea']
      });

      return {
        success: true,
        message: 'Tarea calificada exitosamente',
        nota: {
          ...notaCompleta,
          calificacionLiteral: createNotaTareaKinderDto.calificacion,
          descripcionCalificacion: this.numeroACalificacionLiteral(puntajeNumerico).descripcion
        },
        estudiante: entregaEncontrada.idEstudiante2.nombre + ' ' + entregaEncontrada.idEstudiante2.apellido,
        tarea: entregaEncontrada.idTarea2.titulo
      };
    });
  }

  // Función helper para convertir puntaje numérico a calificación literal (sistema peruano kinder)
  private convertirPuntajeALetra(puntaje: number): string {
    if (puntaje >= 18) return 'AD'; // Logro destacado
    if (puntaje >= 14) return 'A';  // Logro esperado
    if (puntaje >= 11) return 'B';  // En proceso
    return 'C';                     // En inicio
  }

  // Función helper para determinar el nivel de logro
  private obtenerNivelLogro(calificacion: string): string {
    switch (calificacion) {
      case 'AD': return 'Logro destacado';
      case 'A': return 'Logro esperado';
      case 'B': return 'En proceso';
      case 'C': return 'En inicio';
      default: return 'Sin calificar';
    }
  }


  async calificarTarea(createNotaTareaDto: CreateNotaTareaDto): Promise<any> {
    return await this.dataSource.transaction(async manager => {

      // 1. Verificar que la tarea entrega existe y está entregada
      const entregaEncontrada = await this.tareaEntregaService.findByEstudianteTarea(createNotaTareaDto.idEstudiante, createNotaTareaDto.idTarea);
      if (!entregaEncontrada) {
        throw new NotFoundException("No se encontró la entrega de la tarea");
      }

      if (!entregaEncontrada.realizoTarea) {
        throw new BadRequestException("No se puede calificar una tarea que no fue realizada");
      }

      // 2. Verificar que no existe una nota previa para esta tarea-estudiante
      const notaExistente = await manager.findOne(Nota, {
        where: {
          idTareaColumn: createNotaTareaDto.idTarea,
          idEstudiante: createNotaTareaDto.idEstudiante
        }
      });

      if (notaExistente) {
        throw new BadRequestException("Esta tarea ya tiene una calificación asignada");
      }

      // 3. Crear la nota
      const nota = manager.create(Nota, {
        puntaje: createNotaTareaDto.puntaje.toString(),
        estaAprobado: createNotaTareaDto.estaAprobado ?? (createNotaTareaDto.puntaje >= 11),
        observaciones: createNotaTareaDto.observaciones || null,
        idEstudiante: createNotaTareaDto.idEstudiante,
        idTareaColumn: createNotaTareaDto.idTarea,
        idEvaluacion: null // Para tareas no hay evaluación
      });

      const notaGuardada = await manager.save(Nota, nota);

      // 4. Actualizar estado de la entrega a 'revisado'
      entregaEncontrada.estado = 'revisado';
      await manager.save(TareaEntrega, entregaEncontrada);

      // 5. Cargar nota completa con relaciones
      const notaCompleta = await manager.findOne(Nota, {
        where: { idNota: notaGuardada.idNota },
        relations: ['idEstudiante2', 'idTarea']
      });

      return {
        success: true,
        message: 'Tarea calificada exitosamente',
        nota: notaCompleta,
        estudiante: entregaEncontrada.idEstudiante2.nombre + ' ' + entregaEncontrada.idEstudiante2.apellido,
        tarea: entregaEncontrada.idTarea2.titulo
      };
    });
  }

  async create(createNotaDto: CreateNotaDto): Promise<Nota> {
    // Verificar que no existe una nota previa para esta evaluación-estudiante
    const notaExistente = await this.notaRepository.findOne({
      where: {
        idEvaluacion: createNotaDto.idEvaluacion,
        idEstudiante: createNotaDto.idEstudiante
      }
    });

    if (notaExistente) {
      throw new BadRequestException("Ya existe una nota para esta evaluación y estudiante");
    }

    const notaData = {
      puntaje: createNotaDto.puntaje.toString(),
      estaAprobado: createNotaDto.estaAprobado ?? (createNotaDto.puntaje >= 11),
      observaciones: createNotaDto.observaciones,
      idEvaluacion: createNotaDto.idEvaluacion,
      idEstudiante: createNotaDto.idEstudiante,
      idEvaluacion2: { idEvaluacion: createNotaDto.idEvaluacion },
      idEstudiante2: { idEstudiante: createNotaDto.idEstudiante }
    };
    const nota = this.notaRepository.create(notaData);
    return await this.notaRepository.save(nota);
  }

  async findAll(): Promise<Nota[]> {
    return await this.notaRepository.find();
  }

  async findOne(id: string): Promise<Nota | null> {
    return await this.notaRepository.findOne({ where: { idNota: id } });
  }

  async update(id: string, updateNotaDto: UpdateNotaDto): Promise<Nota | null> {
    const notaFound = await this.notaRepository.findOne({ where: { idNota: id } });
    if (!notaFound) {
      throw new NotFoundException(`Nota with id ${id} not found`);
    }

    const updateData: any = {
      estaAprobado: updateNotaDto.estaAprobado,
      observaciones: updateNotaDto.observaciones,
    };

    if (updateNotaDto.puntaje !== undefined) {
      updateData.puntaje = updateNotaDto.puntaje.toString();
    }

    if (updateNotaDto.idEvaluacion) {
      updateData.idEvaluacion = updateNotaDto.idEvaluacion;
      updateData.idEvaluacion2 = { idEvaluacion: updateNotaDto.idEvaluacion };
    }

    if (updateNotaDto.idEstudiante) {
      updateData.idEstudiante = updateNotaDto.idEstudiante;
      updateData.idEstudiante2 = { idEstudiante: updateNotaDto.idEstudiante };
    }

    await this.notaRepository.update({ idNota: id }, updateData);
    return this.findOne(id);
  }

  async obtenerLibretaPorAula(idAula: string): Promise<any> {
    // Obtener estudiantes del aula
    const estudiantesAula = await this.matriculaAulaService.obtenerEstudiantesDelAula(idAula);

    // Obtener notas de todos los estudiantes del aula
    const libretas: any[] = [];

    for (const estudianteAula of estudiantesAula) {
      const libretaEstudiante = await this.obtenerLibretaEstudiante(
        estudianteAula.matricula.idEstudiante.idEstudiante
      );
      libretas.push(libretaEstudiante);
    }

    // Calcular estadísticas del aula
    const promedioAula = libretas.length > 0
      ? libretas.reduce((sum, lib) => sum + lib.resumen.promedioGeneral, 0) / libretas.length
      : 0;

    const estudiantesAprobados = libretas.filter(lib => lib.resumen.estaAprobado).length;

    return {
      success: true,
      aula: {
        idAula,
        totalEstudiantes: libretas.length,
        estudiantesAprobados,
        porcentajeAprobacion: Math.round((estudiantesAprobados / libretas.length) * 100),
        promedioAula: Math.round(promedioAula * 100) / 100
      },
      libretas: libretas.sort((a, b) =>
        (a.estudiante?.apellido || '').localeCompare(b.estudiante?.apellido || '')
      )
    };
  }

  // Método específico para libreta por aula - sistema kinder
  async obtenerLibretaAulaKinder(idAula: string): Promise<any> {
    // Obtener estudiantes del aula
    const estudiantesAula = await this.matriculaAulaService.obtenerEstudiantesDelAula(idAula);

    if (estudiantesAula.length === 0) {
      return {
        success: true,
        message: 'No se encontraron estudiantes en esta aula',
        aula: {
          idAula,
          totalEstudiantes: 0
        },
        libretas: []
      };
    }

    // Obtener libretas de kinder de todos los estudiantes
    const libretas: any[] = [];

    for (const estudianteAula of estudiantesAula) {
      const libretaKinder = await this.obtenerLibretaKinder(
        estudianteAula.matricula.idEstudiante.idEstudiante
      );
      libretas.push(libretaKinder);
    }

    // Calcular estadísticas del aula para kinder
    const estudiantesConNotas = libretas.filter(lib => lib.libreta.areas.length > 0);

    let estadisticasGenerales = {
      totalDestacados: 0,
      totalLogrados: 0,
      totalEnProceso: 0,
      totalEnInicio: 0
    };

    if (estudiantesConNotas.length > 0) {
      estadisticasGenerales = estudiantesConNotas.reduce((acc, lib) => {
        acc.totalDestacados += lib.libreta.resumenGeneral.areasDestacadas;
        acc.totalLogrados += lib.libreta.resumenGeneral.areasLogradas;
        acc.totalEnProceso += lib.libreta.resumenGeneral.areasEnProceso;
        acc.totalEnInicio += lib.libreta.resumenGeneral.areasEnInicio;
        return acc;
      }, estadisticasGenerales);
    }

    return {
      success: true,
      aula: {
        idAula,
        totalEstudiantes: libretas.length,
        estudiantesConCalificaciones: estudiantesConNotas.length,
        estadisticasGenerales
      },
      libretas: libretas.sort((a, b) => {
        const apellidoA = a.estudiante?.apellido || '';
        const apellidoB = b.estudiante?.apellido || '';
        return apellidoA.localeCompare(apellidoB);
      })
    };
  }

  async obtenerLibretaEstudiante(idEstudiante: string): Promise<any> {
    const notas = await this.notaRepository
      .createQueryBuilder('nota')
      .leftJoinAndSelect('nota.idEvaluacion2', 'evaluacion')
      .leftJoinAndSelect('evaluacion.idCurso', 'curso')
      .leftJoinAndSelect('nota.idTarea', 'tarea')
      .leftJoinAndSelect('nota.idEstudiante2', 'estudiante')
      .where('nota.idEstudiante = :idEstudiante', { idEstudiante })
      .orderBy('evaluacion.fecha', 'DESC')
      .addOrderBy('tarea.fechaAsignacion', 'DESC')
      .getMany();

    // Separar notas por tipo
    const notasEvaluaciones = notas.filter(nota => nota.idEvaluacion !== null);
    const notasTareas = notas.filter(nota => nota.idTareaColumn !== null);

    // Calcular promedios
    const promedioEvaluaciones = notasEvaluaciones.length > 0
      ? notasEvaluaciones.reduce((sum, nota) => sum + parseFloat(nota.puntaje), 0) / notasEvaluaciones.length
      : 0;

    const promedioTareas = notasTareas.length > 0
      ? notasTareas.reduce((sum, nota) => sum + parseFloat(nota.puntaje), 0) / notasTareas.length
      : 0;

    const promedioGeneral = notas.length > 0
      ? notas.reduce((sum, nota) => sum + parseFloat(nota.puntaje), 0) / notas.length
      : 0;

    return {
      success: true,
      estudiante: notas[0]?.idEstudiante2 || null,
      resumen: {
        totalNotas: notas.length,
        notasEvaluaciones: notasEvaluaciones.length,
        notasTareas: notasTareas.length,
        promedioEvaluaciones: Math.round(promedioEvaluaciones * 100) / 100,
        promedioTareas: Math.round(promedioTareas * 100) / 100,
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        estaAprobado: promedioGeneral >= 11
      },
      notasPorTipo: {
        evaluaciones: notasEvaluaciones.map(nota => ({
          idNota: nota.idNota,
          puntaje: parseFloat(nota.puntaje),
          fecha: nota.idEvaluacion2?.fecha,
          curso: nota.idEvaluacion2?.idCurso?.nombreCurso,
          tipoEvaluacion: nota.idEvaluacion2?.tipoEvaluacion,
          descripcion: nota.idEvaluacion2?.descripcion,
          observaciones: nota.observaciones,
          estaAprobado: nota.estaAprobado
        })),
        tareas: notasTareas.map(nota => ({
          idNota: nota.idNota,
          puntaje: parseFloat(nota.puntaje),
          fechaEntrega: nota.idTarea?.fechaEntrega,
          tituloTarea: nota.idTarea?.titulo,
          descripcionTarea: nota.idTarea?.descripcion,
          observaciones: nota.observaciones,
          estaAprobado: nota.estaAprobado
        }))
      }
    };
  }

  // Método específico para libreta de kinder con calificaciones literales
  async obtenerLibretaKinder(idEstudiante: string): Promise<any> {
    const notas = await this.notaRepository
      .createQueryBuilder('nota')
      .leftJoinAndSelect('nota.idEvaluacion2', 'evaluacion')
      .leftJoinAndSelect('evaluacion.idCurso', 'curso')
      .leftJoinAndSelect('nota.idTarea', 'tarea')
      .leftJoinAndSelect('nota.idEstudiante2', 'estudiante')
      .where('nota.idEstudiante = :idEstudiante', { idEstudiante })
      .orderBy('curso.nombreCurso', 'ASC')
      .addOrderBy('evaluacion.fecha', 'DESC')
      .getMany();

    if (notas.length === 0) {
      return {
        success: true,
        estudiante: null,
        message: 'No se encontraron calificaciones para este estudiante',
        libreta: {
          areas: [],
          resumenGeneral: {
            totalAreas: 0,
            areasDestacadas: 0,
            areasLogradas: 0,
            areasEnProceso: 0,
            areasEnInicio: 0
          }
        }
      };
    }

    // Agrupar notas por curso/área
    const notasPorCurso = notas.reduce((acc, nota) => {
      const nombreCurso = nota.idEvaluacion2?.idCurso?.nombreCurso || 'Sin curso';
      if (!acc[nombreCurso]) {
        acc[nombreCurso] = [];
      }
      acc[nombreCurso].push(nota);
      return acc;
    }, {} as Record<string, typeof notas>);

    // Procesar cada área/curso
    const areas = Object.entries(notasPorCurso).map(([nombreCurso, notasCurso]) => {
      const promedioCurso = notasCurso.reduce((sum, nota) => sum + parseFloat(nota.puntaje), 0) / notasCurso.length;
      const calificacionLiteral = this.convertirPuntajeALetra(promedioCurso);
      const nivelLogro = this.obtenerNivelLogro(calificacionLiteral);

      return {
        area: nombreCurso,
        calificacion: calificacionLiteral,
        nivelLogro: nivelLogro,
        promedio: Math.round(promedioCurso * 100) / 100,
        totalEvaluaciones: notasCurso.length,
        evaluaciones: notasCurso.map(nota => ({
          fecha: nota.idEvaluacion2?.fecha,
          descripcion: nota.idEvaluacion2?.descripcion || 'Evaluación',
          puntaje: parseFloat(nota.puntaje),
          calificacion: this.convertirPuntajeALetra(parseFloat(nota.puntaje)),
          observaciones: nota.observaciones
        }))
      };
    });

    // Calcular resumen general
    const calificaciones = areas.map(area => area.calificacion);
    const resumenGeneral = {
      totalAreas: areas.length,
      areasDestacadas: calificaciones.filter(c => c === 'AD').length,
      areasLogradas: calificaciones.filter(c => c === 'A').length,
      areasEnProceso: calificaciones.filter(c => c === 'B').length,
      areasEnInicio: calificaciones.filter(c => c === 'C').length
    };

    return {
      success: true,
      estudiante: notas[0]?.idEstudiante2,
      libreta: {
        areas: areas,
        resumenGeneral: resumenGeneral
      }
    };
  }

  async remove(id: string): Promise<any> {
    const nota = await this.notaRepository.findOne({ where: { idNota: id } });
    if (!nota) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }

    await this.notaRepository.remove(nota);
    return {
      message: 'Nota eliminada exitosamente',
      notaEliminada: nota
    };
  }

}
