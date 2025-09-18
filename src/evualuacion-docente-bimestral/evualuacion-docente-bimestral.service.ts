import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateEvualuacionDocenteBimestralDto } from './dto/create-evualuacion-docente-bimestral.dto';
import { UpdateEvualuacionDocenteBimestralDto } from './dto/update-evualuacion-docente-bimestral.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluacionDocenteBimestral } from './entities/evualuacion-docente-bimestral.entity';
import { Bimestre } from '../bimestre/entities/bimestre.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { Repository } from 'typeorm';
import { ObservacionDocenteService } from '../observacion-docente/observacion-docente.service';

@Injectable()
export class EvualuacionDocenteBimestralService {

  constructor(
    @InjectRepository(EvaluacionDocenteBimestral)
    private readonly evaluacionRepository: Repository<EvaluacionDocenteBimestral>,
    @InjectRepository(Bimestre)
    private readonly bimestreRepository: Repository<Bimestre>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    private readonly observacionDocenteService: ObservacionDocenteService
  ) { }

  // Solo coordinadores pueden crear evaluaciones
  async create(createEvaluacionDto: CreateEvualuacionDocenteBimestralDto, coordinadorId: string): Promise<{ success: boolean; message: string; evaluacion: EvaluacionDocenteBimestral }> {

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
    const bimestre = await this.bimestreRepository.findOne({
      where: { idBimestre: createEvaluacionDto.idBimestre }
    });

    if (!bimestre) {
      throw new NotFoundException('El bimestre especificado no existe');
    }

    if (!bimestre.estaActivo) {
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

    // Calcular puntaje total y calificación final
    const puntajeTotal = this.calcularPuntajeTotal(createEvaluacionDto);
    const calificacionFinal = this.determinarCalificacionFinal(puntajeTotal);

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

    // Crear la evaluación
    const evaluacion = this.evaluacionRepository.create({
      puntajePlanificacion: createEvaluacionDto.puntajePlanificacion.toString(),
      puntajeMetodologia: createEvaluacionDto.puntajeMetodologia.toString(),
      puntajePuntualidad: createEvaluacionDto.puntajePuntualidad.toString(),
      puntajeCreatividad: createEvaluacionDto.puntajeCreatividad.toString(),
      puntajeComunicacion: createEvaluacionDto.puntajeComunicacion.toString(),
      puntajeTotal: puntajeTotal.toString(),
      calificacionFinal,
      observaciones: observacionesFinal,
      fechaEvaluacion: createEvaluacionDto.fechaEvaluacion || new Date().toISOString().split('T')[0],
      idTrabajador: createEvaluacionDto.idTrabajador,
      idBimestre: createEvaluacionDto.idBimestre,
      idCoordinador: coordinador,
      idTrabajador2: trabajadorEvaluado,
      idBimestre2: bimestre
    });

    const savedEvaluacion = await this.evaluacionRepository.save(evaluacion);

    // IMPORTANTE: Marcar observaciones como CALIFICADO
    await this.observacionDocenteService.marcarComoCalificado(
      createEvaluacionDto.idTrabajador,
      createEvaluacionDto.idBimestre
    );

    return {
      success: true,
      message: `Evaluación docente creada correctamente. Calificación final: ${calificacionFinal}`,
      evaluacion: savedEvaluacion
    };
  }

  // Calcular puntaje total (promedio de los 5 criterios)
  private calcularPuntajeTotal(dto: CreateEvualuacionDocenteBimestralDto): number {
    const suma = dto.puntajePlanificacion + dto.puntajeMetodologia +
      dto.puntajePuntualidad + dto.puntajeCreatividad + dto.puntajeComunicacion;
    return Math.round((suma / 5) * 100) / 100; // Redondear a 2 decimales
  }

  // Determinar calificación final basada en el puntaje
  private determinarCalificacionFinal(puntajeTotal: number): string {
    if (puntajeTotal >= 18) return 'A';  // Excelente
    if (puntajeTotal >= 15) return 'B';  // Bueno
    if (puntajeTotal >= 12) return 'C';  // Regular
    if (puntajeTotal >= 10) return 'D';  // Deficiente
    return 'E';                          // Muy deficiente
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

    if (updateEvaluacionDto.puntajePlanificacion || updateEvaluacionDto.puntajeMetodologia ||
      updateEvaluacionDto.puntajePuntualidad || updateEvaluacionDto.puntajeCreatividad ||
      updateEvaluacionDto.puntajeComunicacion) {

      const datosActuales = {
        puntajePlanificacion: updateEvaluacionDto.puntajePlanificacion || parseFloat(evaluacion.puntajePlanificacion),
        puntajeMetodologia: updateEvaluacionDto.puntajeMetodologia || parseFloat(evaluacion.puntajeMetodologia),
        puntajePuntualidad: updateEvaluacionDto.puntajePuntualidad || parseFloat(evaluacion.puntajePuntualidad),
        puntajeCreatividad: updateEvaluacionDto.puntajeCreatividad || parseFloat(evaluacion.puntajeCreatividad),
        puntajeComunicacion: updateEvaluacionDto.puntajeComunicacion || parseFloat(evaluacion.puntajeComunicacion),
        idTrabajador: evaluacion.idTrabajador,
        idBimestre: evaluacion.idBimestre,
        idCoordinador: evaluacion.idCoordinador.idTrabajador
      };

      const nuevoPuntajeTotal = this.calcularPuntajeTotal(datosActuales);
      const nuevaCalificacion = this.determinarCalificacionFinal(nuevoPuntajeTotal);

      updateData.puntajeTotal = nuevoPuntajeTotal.toString();
      updateData.calificacionFinal = nuevaCalificacion;

      // Convertir números a strings para la BD
      if (updateData.puntajePlanificacion) updateData.puntajePlanificacion = updateData.puntajePlanificacion.toString();
      if (updateData.puntajeMetodologia) updateData.puntajeMetodologia = updateData.puntajeMetodologia.toString();
      if (updateData.puntajePuntualidad) updateData.puntajePuntualidad = updateData.puntajePuntualidad.toString();
      if (updateData.puntajeCreatividad) updateData.puntajeCreatividad = updateData.puntajeCreatividad.toString();
      if (updateData.puntajeComunicacion) updateData.puntajeComunicacion = updateData.puntajeComunicacion.toString();
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
