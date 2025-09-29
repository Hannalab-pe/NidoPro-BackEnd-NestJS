import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateEvualuacionDocenteBimestralDto } from './dto/create-evualuacion-docente-bimestral.dto';
import { UpdateEvualuacionDocenteBimestralDto } from './dto/update-evualuacion-docente-bimestral.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluacionDocenteBimestral } from './entities/evualuacion-docente-bimestral.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { Repository } from 'typeorm';
import { ObservacionDocenteService } from '../observacion-docente/observacion-docente.service';
import { BimestreService } from 'src/bimestre/bimestre.service';
import { TipoCalificacion, CalificacionLiteral } from './enums/tipo-calificacion.enum';

@Injectable()
export class EvualuacionDocenteBimestralService {

  constructor(
    @InjectRepository(EvaluacionDocenteBimestral)
    private readonly evaluacionRepository: Repository<EvaluacionDocenteBimestral>,
    private readonly bimestreRepository: BimestreService,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    private readonly observacionDocenteService: ObservacionDocenteService
  ) { }

  // Solo coordinadores pueden crear evaluaciones
  async create(createEvaluacionDto: CreateEvualuacionDocenteBimestralDto, coordinadorId: string): Promise<{ success: boolean; message: string; evaluacion: EvaluacionDocenteBimestral; configuracion?: any }> {

    // Validar que el coordinador existe y tiene el rol adecuado
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador) {
      throw new NotFoundException('Coordinador no encontrado');
    }

    if (coordinador.idRol.nombre !== 'COORDINADOR' && coordinador.idRol.nombre !== 'DIRECTORA') {
      throw new ForbiddenException('Solo los coordinadores pueden crear evaluaciones');
    }

    // Validar que el bimestre existe y está activo
    const bimestre = await this.bimestreRepository.findBimestreActual();

    if (!bimestre) {
      throw new NotFoundException('El bimestre especificado no existe');
    }

    if (!bimestre) {
      throw new NotFoundException('El bimestre especificado no existe');
    }

    if (!bimestre.bimestre?.estaActivo) {
      throw new BadRequestException('No se pueden crear evaluaciones para un bimestre inactivo');
    }

    // Validar que el trabajador evaluado existe
    const trabajadorEvaluado = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createEvaluacionDto.idTrabajador }
    });

    if (!trabajadorEvaluado) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    if (!trabajadorEvaluado.estaActivo) {
      throw new BadRequestException('El trabajador no está activo');
    }

    // Verificar que no existe ya una evaluación para este trabajador/bimestre
    const evaluacionExistente = await this.evaluacionRepository.findOne({
      where: {
        idTrabajador: createEvaluacionDto.idTrabajador,
        idBimestre: createEvaluacionDto.idBimestre
      }
    });

    if (evaluacionExistente) {
      throw new BadRequestException('Ya existe una evaluación para este trabajador en este bimestre');
    }

    // Procesamiento configurativo basado en tipoCalificacion
    const { puntajesNumericos, calificacionFinal, configuracion } = this.procesarCalificaciones(createEvaluacionDto);

    // Obtener observaciones del trabajador para incluir en la evaluación
    const observacionesDocente = await this.observacionDocenteService.findByTrabajador(createEvaluacionDto.idTrabajador);
    const observacionesDelBimestre = observacionesDocente.observaciones.filter(
      obs => obs.idBimestre.idBimestre === createEvaluacionDto.idBimestre && obs.estado === 'APROBADO'
    );

    // Incluir observaciones en el comentario final
    let observacionesFinal = createEvaluacionDto.observaciones || '';
    if (observacionesDelBimestre.length > 0) {
      const resumenObservaciones = observacionesDelBimestre.map(obs =>
        `- ${obs.tipoObservacion}: ${obs.motivo}`
      ).join('\n');

      observacionesFinal += `\n\nObservaciones registradas durante el bimestre:\n${resumenObservaciones}`;
    }

    // Crear la evaluación con valores procesados
    const evaluacion = this.evaluacionRepository.create({
      puntajePlanificacion: puntajesNumericos.planificacion.toString(),
      puntajeMetodologia: puntajesNumericos.metodologia.toString(),
      puntajePuntualidad: puntajesNumericos.puntualidad.toString(),
      puntajeCreatividad: puntajesNumericos.creatividad.toString(),
      puntajeComunicacion: puntajesNumericos.comunicacion.toString(),
      puntajeTotal: puntajesNumericos.total.toString(),
      calificacionFinal,
      observaciones: observacionesFinal,
      fechaEvaluacion: createEvaluacionDto.fechaEvaluacion || new Date().toISOString().split('T')[0],
      idTrabajador: createEvaluacionDto.idTrabajador,
      idBimestre: createEvaluacionDto.idBimestre,
      idCoordinador: coordinador,
      idTrabajador2: trabajadorEvaluado,
      idBimestre2: bimestre.bimestre // Pass the full Bimestre object, not just the id
    });

    const savedEvaluacion = await this.evaluacionRepository.save(evaluacion);

    // IMPORTANTE: Marcar observaciones como CALIFICADO
    await this.observacionDocenteService.marcarComoCalificado(
      createEvaluacionDto.idTrabajador,
      createEvaluacionDto.idBimestre
    );

    return {
      success: true,
      message: `Evaluación creada. Modo: ${createEvaluacionDto.tipoCalificacion}. Calificación final: ${calificacionFinal}`,
      evaluacion: savedEvaluacion,
      configuracion
    };
  }

  // Método principal para procesar calificaciones según configuración
  private procesarCalificaciones(dto: CreateEvualuacionDocenteBimestralDto): {
    puntajesNumericos: any;
    calificacionFinal: string;
    configuracion: any;
  } {
    // Detectar modo automáticamente si no se especifica o por retrocompatibilidad
    let tipoCalificacion = dto.tipoCalificacion;

    if (!tipoCalificacion) {
      // Modo retrocompatibilidad: detectar automáticamente
      if (dto.puntajePlanificacion !== undefined) {
        tipoCalificacion = TipoCalificacion.NUMERICA;
      } else if (dto.puntajePlanificacionNumerico !== undefined) {
        tipoCalificacion = TipoCalificacion.NUMERICA;
      } else if (dto.puntajePlanificacionLiteral !== undefined) {
        tipoCalificacion = TipoCalificacion.LITERAL;
      } else {
        throw new BadRequestException('Debe especificar el tipo de calificación o proporcionar puntajes válidos');
      }
    }

    if (tipoCalificacion === TipoCalificacion.NUMERICA) {
      return this.procesarCalificacionesNumericas(dto);
    } else {
      return this.procesarCalificacionesLiterales(dto);
    }
  }

  // Procesar calificaciones cuando el tipo es NUMERICA
  private procesarCalificacionesNumericas(dto: CreateEvualuacionDocenteBimestralDto): {
    puntajesNumericos: any;
    calificacionFinal: string;
    configuracion: any;
  } {
    // Obtener puntajes numéricos (priorizar nuevos campos, usar deprecated como fallback)
    const puntajesNumericos = {
      planificacion: dto.puntajePlanificacionNumerico ?? dto.puntajePlanificacion ?? 0,
      metodologia: dto.puntajeMetodologiaNumerico ?? dto.puntajeMetodologia ?? 0,
      puntualidad: dto.puntajePuntualidadNumerico ?? dto.puntajePuntualidad ?? 0,
      creatividad: dto.puntajeCreatividadNumerico ?? dto.puntajeCreatividad ?? 0,
      comunicacion: dto.puntajeComunicacionNumerico ?? dto.puntajeComunicacion ?? 0,
      total: 0
    };

    // Validar que todos los puntajes estén presentes
    if (puntajesNumericos.planificacion === 0 || puntajesNumericos.metodologia === 0 ||
      puntajesNumericos.puntualidad === 0 || puntajesNumericos.creatividad === 0 ||
      puntajesNumericos.comunicacion === 0) {
      throw new BadRequestException('Todos los puntajes numéricos son requeridos para el modo NUMERICA');
    }

    puntajesNumericos.total = this.calcularPuntajeTotalNumerico(puntajesNumericos);
    const calificacionFinal = this.determinarCalificacionFinalNumerica(puntajesNumericos.total);

    return {
      puntajesNumericos,
      calificacionFinal,
      configuracion: {
        tipoUtilizado: TipoCalificacion.NUMERICA,
        modoConversion: 'DIRECTO',
        valoresOriginales: puntajesNumericos,
        valoresAlmacenados: puntajesNumericos
      }
    };
  }

  // Procesar calificaciones cuando el tipo es LITERAL
  private procesarCalificacionesLiterales(dto: CreateEvualuacionDocenteBimestralDto): {
    puntajesNumericos: any;
    calificacionFinal: string;
    configuracion: any;
  } {
    // Validar que todos los puntajes literales estén presentes
    if (!dto.puntajePlanificacionLiteral || !dto.puntajeMetodologiaLiteral ||
      !dto.puntajePuntualidadLiteral || !dto.puntajeCreatividadLiteral ||
      !dto.puntajeComunicacionLiteral) {
      throw new BadRequestException('Todos los puntajes literales son requeridos para el modo LITERAL');
    }

    const valoresOriginales = {
      planificacion: dto.puntajePlanificacionLiteral,
      metodologia: dto.puntajeMetodologiaLiteral,
      puntualidad: dto.puntajePuntualidadLiteral,
      creatividad: dto.puntajeCreatividadLiteral,
      comunicacion: dto.puntajeComunicacionLiteral
    };

    // Convertir a numérico para almacenamiento
    const puntajesNumericos = {
      planificacion: this.convertirLiteralANumerico(dto.puntajePlanificacionLiteral),
      metodologia: this.convertirLiteralANumerico(dto.puntajeMetodologiaLiteral),
      puntualidad: this.convertirLiteralANumerico(dto.puntajePuntualidadLiteral),
      creatividad: this.convertirLiteralANumerico(dto.puntajeCreatividadLiteral),
      comunicacion: this.convertirLiteralANumerico(dto.puntajeComunicacionLiteral),
      total: 0
    };

    puntajesNumericos.total = this.calcularPuntajeTotalNumerico(puntajesNumericos);

    // En modo literal, la calificación final se basa en el promedio literal
    const calificacionFinal = this.determinarCalificacionLiteralPromedio(valoresOriginales);

    return {
      puntajesNumericos,
      calificacionFinal,
      configuracion: {
        tipoUtilizado: TipoCalificacion.LITERAL,
        modoConversion: 'LITERAL_A_NUMERICO',
        valoresOriginales,
        valoresAlmacenados: puntajesNumericos
      }
    };
  }

  // Calcular puntaje total numérico (promedio de los 5 criterios)
  private calcularPuntajeTotalNumerico(puntajes: any): number {
    const suma = puntajes.planificacion + puntajes.metodologia +
      puntajes.puntualidad + puntajes.creatividad + puntajes.comunicacion;
    return Math.round((suma / 5) * 100) / 100; // Redondear a 2 decimales
  }

  // Determinar calificación final basada en el puntaje numérico
  private determinarCalificacionFinalNumerica(puntajeTotal: number): string {
    if (puntajeTotal >= 18) return 'A';  // Excelente
    if (puntajeTotal >= 15) return 'B';  // Bueno
    if (puntajeTotal >= 12) return 'C';  // Regular
    if (puntajeTotal >= 10) return 'AD'; // Deficiente (cambiado de D a AD)
    return 'AD';                         // Muy deficiente (cambiado de E a AD)
  }

  // Convertir calificación literal a valor numérico para almacenamiento
  private convertirLiteralANumerico(literal: CalificacionLiteral): number {
    const conversion = {
      [CalificacionLiteral.A]: 19,   // Excelente (18-20)
      [CalificacionLiteral.B]: 16,   // Bueno (15-17)
      [CalificacionLiteral.C]: 13,   // Regular (12-14)
      [CalificacionLiteral.AD]: 9    // Deficiente (0-11)
    };
    return conversion[literal];
  }

  // Determinar calificación final basada en calificaciones literales
  private determinarCalificacionLiteralPromedio(valoresLiterales: any): string {
    const literales = [
      valoresLiterales.planificacion,
      valoresLiterales.metodologia,
      valoresLiterales.puntualidad,
      valoresLiterales.creatividad,
      valoresLiterales.comunicacion
    ];

    // Contar frecuencia de cada calificación
    const conteo = literales.reduce((acc, literal) => {
      acc[literal] = (acc[literal] || 0) + 1;
      return acc;
    }, {});

    // Determinar calificación predominante
    // Priorizar calificaciones más altas en caso de empate
    const prioridad = [CalificacionLiteral.A, CalificacionLiteral.B, CalificacionLiteral.C, CalificacionLiteral.AD];

    for (const calificacion of prioridad) {
      if (conteo[calificacion] >= 3) { // Si hay 3 o más de la misma calificación
        return calificacion;
      }
    }

    // Si no hay predominancia clara, usar la más frecuente
    const predominante = Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b);

    return predominante;
  }

  // Calcular puntaje total (método legacy para retrocompatibilidad)
  private calcularPuntajeTotal(dto: CreateEvualuacionDocenteBimestralDto): number {
    const suma = (dto.puntajePlanificacion || 0) + (dto.puntajeMetodologia || 0) +
      (dto.puntajePuntualidad || 0) + (dto.puntajeCreatividad || 0) + (dto.puntajeComunicacion || 0);
    return Math.round((suma / 5) * 100) / 100; // Redondear a 2 decimales
  }

  // Determinar calificación final basada en el puntaje (método legacy para retrocompatibilidad)
  private determinarCalificacionFinal(puntajeTotal: number): string {
    if (puntajeTotal >= 18) return 'A';  // Excelente
    if (puntajeTotal >= 15) return 'B';  // Bueno
    if (puntajeTotal >= 12) return 'C';  // Regular
    if (puntajeTotal >= 10) return 'AD'; // Deficiente (cambiado de D a AD)
    return 'AD';                         // Muy deficiente (cambiado de E a AD)
  }

  // Generar reporte detallado de evaluación
  async generarReporteDetallado(id: string): Promise<{ success: boolean; reporte: any }> {
    const evaluacion = await this.findOne(id);

    const observaciones = await this.observacionDocenteService.findByTrabajador(evaluacion.idTrabajador);
    const observacionesDelBimestre = observaciones.observaciones.filter(
      obs => obs.idBimestre.idBimestre === evaluacion.idBimestre
    );

    const reporte = {
      evaluacion,
      observacionesAsociadas: observacionesDelBimestre,
      resumen: {
        criterios: {
          planificacion: parseFloat(evaluacion.puntajePlanificacion),
          metodologia: parseFloat(evaluacion.puntajeMetodologia),
          puntualidad: parseFloat(evaluacion.puntajePuntualidad),
          creatividad: parseFloat(evaluacion.puntajeCreatividad),
          comunicacion: parseFloat(evaluacion.puntajeComunicacion)
        },
        puntajeTotal: parseFloat(evaluacion.puntajeTotal),
        calificacionFinal: evaluacion.calificacionFinal,
        totalObservaciones: observacionesDelBimestre.length,
        observacionesPorTipo: this.contarObservacionesPorTipo(observacionesDelBimestre)
      }
    };

    return {
      success: true,
      reporte
    };
  }

  private contarObservacionesPorTipo(observaciones: any[]): any {
    const conteo = {};
    observaciones.forEach(obs => {
      conteo[obs.tipoObservacion] = (conteo[obs.tipoObservacion] || 0) + 1;
    });
    return conteo;
  }

  async findAll(): Promise<{ success: boolean; message: string; evaluaciones: EvaluacionDocenteBimestral[] }> {
    const evaluaciones = await this.evaluacionRepository.find({
      relations: ['idBimestre2', 'idCoordinador', 'idTrabajador2'],
      order: { fechaEvaluacion: 'DESC' }
    });

    return {
      success: true,
      message: 'Evaluaciones encontradas correctamente',
      evaluaciones
    };
  }

  async findByTrabajador(idTrabajador: string): Promise<{ success: boolean; message: string; evaluaciones: EvaluacionDocenteBimestral[] }> {
    const evaluaciones = await this.evaluacionRepository.find({
      where: { idTrabajador },
      relations: ['idBimestre2', 'idCoordinador', 'idTrabajador2'],
      order: { fechaEvaluacion: 'DESC' }
    });

    return {
      success: true,
      message: 'Evaluaciones del trabajador encontradas correctamente',
      evaluaciones
    };
  }

  async findByBimestre(idBimestre: string): Promise<{ success: boolean; message: string; evaluaciones: EvaluacionDocenteBimestral[] }> {
    const evaluaciones = await this.evaluacionRepository.find({
      where: { idBimestre },
      relations: ['idBimestre2', 'idCoordinador', 'idTrabajador2'],
      order: { fechaEvaluacion: 'DESC' }
    });

    return {
      success: true,
      message: 'Evaluaciones del bimestre encontradas correctamente',
      evaluaciones
    };
  }

  async findByCalificacion(calificacion: string): Promise<{ success: boolean; message: string; evaluaciones: EvaluacionDocenteBimestral[] }> {
    const evaluaciones = await this.evaluacionRepository.find({
      where: { calificacionFinal: calificacion },
      relations: ['idBimestre2', 'idCoordinador', 'idTrabajador2'],
      order: { fechaEvaluacion: 'DESC' }
    });

    return {
      success: true,
      message: `Evaluaciones con calificación ${calificacion} encontradas correctamente`,
      evaluaciones
    };
  }

  async findOne(id: string): Promise<EvaluacionDocenteBimestral> {
    const evaluacion = await this.evaluacionRepository.findOne({
      where: { idEvaluacionDocente: id },
      relations: ['idBimestre2', 'idCoordinador', 'idTrabajador2']
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación docente con ID ${id} no encontrada`);
    }

    return evaluacion;
  }

  async update(id: string, updateEvaluacionDto: UpdateEvualuacionDocenteBimestralDto, coordinadorId: string): Promise<{ success: boolean; message: string; evaluacion: EvaluacionDocenteBimestral }> {

    const evaluacion = await this.findOne(id);

    // Validar que quien actualiza es coordinador
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador || coordinador.idRol.nombre !== 'COORDINADOR') {
      throw new ForbiddenException('Solo los coordinadores pueden actualizar evaluaciones');
    }

    // Recalcular puntajes si se actualizan los criterios
    let updateData: any = { ...updateEvaluacionDto };

    // Verificar si hay cambios en puntajes (tanto nuevos campos como deprecated)
    const hayPuntajesNumericos = updateEvaluacionDto.puntajePlanificacionNumerico !== undefined ||
      updateEvaluacionDto.puntajeMetodologiaNumerico !== undefined ||
      updateEvaluacionDto.puntajePuntualidadNumerico !== undefined ||
      updateEvaluacionDto.puntajeCreatividadNumerico !== undefined ||
      updateEvaluacionDto.puntajeComunicacionNumerico !== undefined;

    const hayPuntajesLiterales = updateEvaluacionDto.puntajePlanificacionLiteral !== undefined ||
      updateEvaluacionDto.puntajeMetodologiaLiteral !== undefined ||
      updateEvaluacionDto.puntajePuntualidadLiteral !== undefined ||
      updateEvaluacionDto.puntajeCreatividadLiteral !== undefined ||
      updateEvaluacionDto.puntajeComunicacionLiteral !== undefined;

    const hayPuntajesDeprecated = updateEvaluacionDto.puntajePlanificacion !== undefined ||
      updateEvaluacionDto.puntajeMetodologia !== undefined ||
      updateEvaluacionDto.puntajePuntualidad !== undefined ||
      updateEvaluacionDto.puntajeCreatividad !== undefined ||
      updateEvaluacionDto.puntajeComunicacion !== undefined;

    if (hayPuntajesNumericos || hayPuntajesLiterales || hayPuntajesDeprecated) {
      // Crear DTO temporal para procesar con la nueva lógica
      const dtoTemporal: CreateEvualuacionDocenteBimestralDto = {
        // Determinar tipo de calificación basado en los campos proporcionados
        tipoCalificacion: updateEvaluacionDto.tipoCalificacion ||
          (hayPuntajesLiterales ? TipoCalificacion.LITERAL : TipoCalificacion.NUMERICA),

        // Campos numéricos (usar valores del update o mantener existentes)
        puntajePlanificacionNumerico: updateEvaluacionDto.puntajePlanificacionNumerico ??
          updateEvaluacionDto.puntajePlanificacion ??
          parseFloat(evaluacion.puntajePlanificacion),
        puntajeMetodologiaNumerico: updateEvaluacionDto.puntajeMetodologiaNumerico ??
          updateEvaluacionDto.puntajeMetodologia ??
          parseFloat(evaluacion.puntajeMetodologia),
        puntajePuntualidadNumerico: updateEvaluacionDto.puntajePuntualidadNumerico ??
          updateEvaluacionDto.puntajePuntualidad ??
          parseFloat(evaluacion.puntajePuntualidad),
        puntajeCreatividadNumerico: updateEvaluacionDto.puntajeCreatividadNumerico ??
          updateEvaluacionDto.puntajeCreatividad ??
          parseFloat(evaluacion.puntajeCreatividad),
        puntajeComunicacionNumerico: updateEvaluacionDto.puntajeComunicacionNumerico ??
          updateEvaluacionDto.puntajeComunicacion ??
          parseFloat(evaluacion.puntajeComunicacion),

        // Campos literales
        puntajePlanificacionLiteral: updateEvaluacionDto.puntajePlanificacionLiteral,
        puntajeMetodologiaLiteral: updateEvaluacionDto.puntajeMetodologiaLiteral,
        puntajePuntualidadLiteral: updateEvaluacionDto.puntajePuntualidadLiteral,
        puntajeCreatividadLiteral: updateEvaluacionDto.puntajeCreatividadLiteral,
        puntajeComunicacionLiteral: updateEvaluacionDto.puntajeComunicacionLiteral,

        // Campos requeridos (no se usan en el procesamiento pero son necesarios para el DTO)
        idTrabajador: evaluacion.idTrabajador,
        idBimestre: evaluacion.idBimestre,
        idCoordinador: evaluacion.idCoordinador.idTrabajador
      };

      // Procesar con la nueva lógica
      const { puntajesNumericos, calificacionFinal } = this.procesarCalificaciones(dtoTemporal);

      // Actualizar datos con los valores procesados
      updateData.puntajePlanificacion = puntajesNumericos.planificacion.toString();
      updateData.puntajeMetodologia = puntajesNumericos.metodologia.toString();
      updateData.puntajePuntualidad = puntajesNumericos.puntualidad.toString();
      updateData.puntajeCreatividad = puntajesNumericos.creatividad.toString();
      updateData.puntajeComunicacion = puntajesNumericos.comunicacion.toString();
      updateData.puntajeTotal = puntajesNumericos.total.toString();
      updateData.calificacionFinal = calificacionFinal;

      // Limpiar campos no almacenables
      delete updateData.tipoCalificacion;
      delete updateData.puntajePlanificacionNumerico;
      delete updateData.puntajeMetodologiaNumerico;
      delete updateData.puntajePuntualidadNumerico;
      delete updateData.puntajeCreatividadNumerico;
      delete updateData.puntajeComunicacionNumerico;
      delete updateData.puntajePlanificacionLiteral;
      delete updateData.puntajeMetodologiaLiteral;
      delete updateData.puntajePuntualidadLiteral;
      delete updateData.puntajeCreatividadLiteral;
      delete updateData.puntajeComunicacionLiteral;
    }

    // Excluir campos que no se pueden actualizar directamente
    const { idBimestre, idTrabajador, idCoordinador, ...updateFields } = updateData;

    await this.evaluacionRepository.update(id, updateFields);
    const updatedEvaluacion = await this.findOne(id);

    return {
      success: true,
      message: 'Evaluación docente actualizada correctamente',
      evaluacion: updatedEvaluacion
    };
  }

  async remove(id: string, coordinadorId: string): Promise<{ success: boolean; message: string }> {

    const evaluacion = await this.findOne(id);

    // Validar que quien elimina es coordinador
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador || coordinador.idRol.nombre !== 'COORDINADOR') {
      throw new ForbiddenException('Solo los coordinadores pueden eliminar evaluaciones');
    }

    await this.evaluacionRepository.delete(id);

    return {
      success: true,
      message: 'Evaluación docente eliminada correctamente'
    };
  }

  // Estadísticas del bimestre
  async getEstadisticasBimestre(idBimestre: string): Promise<{ success: boolean; estadisticas: any }> {
    const evaluaciones = await this.evaluacionRepository.find({
      where: { idBimestre },
      relations: ['idTrabajador2']
    });

    if (evaluaciones.length === 0) {
      return {
        success: true,
        estadisticas: {
          totalEvaluaciones: 0,
          promedioGeneral: 0,
          distribucionCalificaciones: {},
          mejorDocente: null,
          peorDocente: null
        }
      };
    }

    const puntajes = evaluaciones.map(e => parseFloat(e.puntajeTotal));
    const promedioGeneral = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;

    const distribucionCalificaciones = {};
    evaluaciones.forEach(e => {
      distribucionCalificaciones[e.calificacionFinal] = (distribucionCalificaciones[e.calificacionFinal] || 0) + 1;
    });

    const mejorEvaluacion = evaluaciones.reduce((max, current) =>
      parseFloat(current.puntajeTotal) > parseFloat(max.puntajeTotal) ? current : max
    );

    const peorEvaluacion = evaluaciones.reduce((min, current) =>
      parseFloat(current.puntajeTotal) < parseFloat(min.puntajeTotal) ? current : min
    );

    return {
      success: true,
      estadisticas: {
        totalEvaluaciones: evaluaciones.length,
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        distribucionCalificaciones,
        mejorDocente: {
          nombre: `${mejorEvaluacion.idTrabajador2.nombre} ${mejorEvaluacion.idTrabajador2.apellido}`,
          puntaje: parseFloat(mejorEvaluacion.puntajeTotal),
          calificacion: mejorEvaluacion.calificacionFinal
        },
        peorDocente: {
          nombre: `${peorEvaluacion.idTrabajador2.nombre} ${peorEvaluacion.idTrabajador2.apellido}`,
          puntaje: parseFloat(peorEvaluacion.puntajeTotal),
          calificacion: peorEvaluacion.calificacionFinal
        }
      }
    };
  }
}
