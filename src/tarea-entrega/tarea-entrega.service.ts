import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateTareaEntregaDto } from './dto/create-tarea-entrega.dto';
import { UpdateTareaEntregaDto } from './dto/update-tarea-entrega.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TareaEntrega } from './entities/tarea-entrega.entity';

@Injectable()
export class TareaEntregaService {
  constructor(
    @InjectRepository(TareaEntrega)
    private readonly tareaEntregaRepository: Repository<TareaEntrega>,
    private readonly datasource: DataSource,
  ) {}

  async registrarEntrega(
    createTareaEntregaDto: CreateTareaEntregaDto,
  ): Promise<any> {
    return await this.datasource.transaction(async (manager) => {
      // 1. VERIFICAR QUE LA ENTREGA EXISTE
      const entregaExistente = await this.findByEstudianteTarea(
        createTareaEntregaDto.idTarea,
        createTareaEntregaDto.idEstudiante,
      );

      if (!entregaExistente) {
        throw new NotFoundException(
          'No se encontró la asignación de tarea para este estudiante',
        );
      }

      // 2. VERIFICAR QUE LA TAREA AÚN ESTÁ ACTIVA
      if (entregaExistente.idTarea2.estado === 'cerrada') {
        throw new BadRequestException(
          'La tarea ya está cerrada y no acepta más registros',
        );
      }

      // 3. VERIFICAR QUE NO ESTÉ YA REGISTRADA
      if (
        entregaExistente.estado === 'entregado' ||
        entregaExistente.estado === 'revisado'
      ) {
        throw new BadRequestException(
          'Esta tarea ya fue registrada previamente',
        );
      }

      // 4. DETERMINAR ESTADO SEGÚN SI REALIZÓ LA TAREA Y LA FECHA
      const fechaActual = new Date();
      const fechaLimite = new Date(entregaExistente.idTarea2.fechaEntrega);

      let estadoFinal: string;
      if (createTareaEntregaDto.realizoTarea) {
        estadoFinal = fechaActual <= fechaLimite ? 'entregado' : 'tarde';
      } else {
        estadoFinal = 'no_realizado';
      }

      // 5. ACTUALIZAR LA ENTREGA
      entregaExistente.fechaEntrega = new Date().toISOString().split('T')[0];
      entregaExistente.archivoUrl = createTareaEntregaDto.archivoUrl || null;
      entregaExistente.estado = estadoFinal;

      const entregaActualizada = await manager.save(
        TareaEntrega,
        entregaExistente,
      );

      // 6. AGREGAR OBSERVACIONES DEL DOCENTE (si las hay)
      let mensajeResultado = '';
      if (createTareaEntregaDto.realizoTarea) {
        mensajeResultado =
          estadoFinal === 'tarde'
            ? `Tarea registrada como realizada (fuera de plazo)`
            : `Tarea registrada como realizada exitosamente`;
      } else {
        mensajeResultado = `Registrado que el estudiante no realizó la tarea`;
      }

      return {
        success: true,
        message: mensajeResultado,
        entrega: entregaActualizada,
        realizoTarea: createTareaEntregaDto.realizoTarea,
        estadoFinal,
        observaciones: createTareaEntregaDto.observaciones,
        estudiante: {
          nombre: entregaExistente.idEstudiante2.nombre,
          apellido: entregaExistente.idEstudiante2.apellido,
        },
        tarea: {
          titulo: entregaExistente.idTarea2.titulo,
          fechaLimite: entregaExistente.idTarea2.fechaEntrega,
        },
      };
    });
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    entregas: TareaEntrega[];
  }> {
    const entregas = await this.tareaEntregaRepository.find({
      relations: [
        'idTarea2',
        'idTarea2.aula',
        'idTarea2.aula.idGrado',
        'idTarea2.idTrabajador',
        'idEstudiante2',
      ],
      order: { fechaEntrega: 'DESC' },
    });

    return {
      success: true,
      message: 'Entregas de tareas obtenidas correctamente',
      entregas,
    };
  }

  async findByEstudianteTarea(idTarea: string, idEstudiante: string) {
    return await this.tareaEntregaRepository
      .createQueryBuilder('tareaEntrega')
      .leftJoinAndSelect('tareaEntrega.idTarea2', 'tarea')
      .leftJoinAndSelect('tareaEntrega.idEstudiante2', 'estudiante')
      .where('tareaEntrega.idTarea = :idTarea', { idTarea })
      .andWhere('tareaEntrega.idEstudiante = :idEstudiante', { idEstudiante })
      .getOne();
  }

  async findOne(id: string): Promise<TareaEntrega> {
    const entrega = await this.tareaEntregaRepository.findOne({
      where: { idTareaEntrega: id },
      relations: [
        'idTarea2',
        'idTarea2.aula',
        'idTarea2.aula.idGrado',
        'idTarea2.idTrabajador',
        'idEstudiante2',
      ],
    });

    if (!entrega) {
      throw new NotFoundException(
        `Entrega de tarea con ID ${id} no encontrada`,
      );
    }

    return entrega;
  }

  async update(
    id: string,
    updateTareaEntregaDto: UpdateTareaEntregaDto,
  ): Promise<{
    success: boolean;
    message: string;
    entrega: TareaEntrega;
    cambiosRealizados: string[];
  }> {
    // 1. Verificar que la entrega existe
    const entrega = await this.findOne(id);

    // 2. Verificar que la tarea no esté cerrada
    if (entrega.idTarea2.estado === 'cerrada') {
      throw new BadRequestException(
        'No se puede modificar una entrega de tarea cerrada',
      );
    }

    // 3. Validar que no se intente cambiar IDs de tarea o estudiante
    if (
      updateTareaEntregaDto.idTarea &&
      updateTareaEntregaDto.idTarea !== entrega.idTarea
    ) {
      throw new BadRequestException(
        'No se puede cambiar la tarea asociada a una entrega',
      );
    }

    if (
      updateTareaEntregaDto.idEstudiante &&
      updateTareaEntregaDto.idEstudiante !== entrega.idEstudiante
    ) {
      throw new BadRequestException(
        'No se puede cambiar el estudiante asociado a una entrega',
      );
    }

    const cambiosRealizados: string[] = [];

    return await this.datasource.transaction(async (manager) => {
      const updateData: any = {};

      // 4. Manejar cambio en realizoTarea
      if (
        updateTareaEntregaDto.realizoTarea !== undefined &&
        updateTareaEntregaDto.realizoTarea !== entrega.realizoTarea
      ) {
        updateData.realizoTarea = updateTareaEntregaDto.realizoTarea;

        // Recalcular estado basado en la fecha
        const fechaActual = new Date();
        const fechaLimite = new Date(entrega.idTarea2.fechaEntrega);

        if (updateTareaEntregaDto.realizoTarea) {
          updateData.estado =
            fechaActual <= fechaLimite ? 'entregado' : 'tarde';
          updateData.fechaEntrega = new Date().toISOString().split('T')[0];
          cambiosRealizados.push('Marcado como tarea realizada');
        } else {
          updateData.estado = 'no_realizado';
          updateData.fechaEntrega = null;
          cambiosRealizados.push('Marcado como tarea no realizada');
        }
      }

      // 5. Actualizar observaciones
      if (
        updateTareaEntregaDto.observaciones !== undefined &&
        updateTareaEntregaDto.observaciones !== entrega.observaciones
      ) {
        updateData.observaciones = updateTareaEntregaDto.observaciones;
        cambiosRealizados.push('Observaciones actualizadas');
      }

      // 6. Actualizar archivo URL
      if (
        updateTareaEntregaDto.archivoUrl !== undefined &&
        updateTareaEntregaDto.archivoUrl !== entrega.archivoUrl
      ) {
        updateData.archivoUrl = updateTareaEntregaDto.archivoUrl;
        cambiosRealizados.push('Archivo/evidencia actualizada');
      }

      // 7. Ejecutar actualización si hay cambios
      if (Object.keys(updateData).length > 0) {
        await manager.update(TareaEntrega, id, updateData);
      }

      // 8. Obtener entrega actualizada
      const entregaActualizada = await manager.findOne(TareaEntrega, {
        where: { idTareaEntrega: id },
        relations: [
          'idTarea2',
          'idTarea2.aula',
          'idTarea2.aula.idGrado',
          'idTarea2.idTrabajador',
          'idEstudiante2',
        ],
      });

      return {
        success: true,
        message:
          cambiosRealizados.length > 0
            ? `Entrega actualizada correctamente. ${cambiosRealizados.length} cambios realizados.`
            : 'No se realizaron cambios en la entrega',
        entrega: entregaActualizada!,
        cambiosRealizados,
      };
    });
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // 1. Verificar que la entrega existe
    const entrega = await this.findOne(id);

    // 2. Verificar que la tarea no esté cerrada
    if (entrega.idTarea2.estado === 'cerrada') {
      throw new BadRequestException(
        'No se puede eliminar una entrega de tarea cerrada',
      );
    }

    // 3. Si la entrega fue realizada, verificar que no haya notas asociadas
    if (entrega.realizoTarea && entrega.estado !== 'pendiente') {
      // Aquí podrías agregar una verificación adicional si tienes notas relacionadas
      throw new ConflictException(
        'No se puede eliminar una entrega que ya fue registrada como realizada. ' +
          'Considere cambiar el estado a "no realizada" en su lugar.',
      );
    }

    await this.tareaEntregaRepository.delete(id);

    return {
      success: true,
      message: `Entrega de tarea eliminada correctamente`,
    };
  }

  // ==================== MÉTODOS ADICIONALES ====================

  async findByTarea(idTarea: string): Promise<{
    success: boolean;
    message: string;
    entregas: TareaEntrega[];
    estadisticas: {
      total: number;
      realizadas: number;
      pendientes: number;
      noRealizadas: number;
      entregasTarde: number;
      porcentajeCompletado: number;
    };
  }> {
    const entregas = await this.tareaEntregaRepository.find({
      where: { idTarea },
      relations: ['idTarea2', 'idTarea2.aula', 'idEstudiante2'],
      order: { fechaEntrega: 'DESC' },
    });

    const total = entregas.length;
    const realizadas = entregas.filter((e) => e.realizoTarea).length;
    const pendientes = entregas.filter((e) => e.estado === 'pendiente').length;
    const noRealizadas = entregas.filter(
      (e) => e.estado === 'no_realizado',
    ).length;
    const entregasTarde = entregas.filter((e) => e.estado === 'tarde').length;
    const porcentajeCompletado =
      total > 0 ? Math.round((realizadas / total) * 100) : 0;

    return {
      success: true,
      message: 'Entregas de la tarea obtenidas correctamente',
      entregas,
      estadisticas: {
        total,
        realizadas,
        pendientes,
        noRealizadas,
        entregasTarde,
        porcentajeCompletado,
      },
    };
  }

  async findByEstudiante(idEstudiante: string): Promise<{
    success: boolean;
    message: string;
    entregas: TareaEntrega[];
  }> {
    const entregas = await this.tareaEntregaRepository.find({
      where: { idEstudiante },
      relations: [
        'idTarea2',
        'idTarea2.aula',
        'idTarea2.aula.idGrado',
        'idTarea2.idTrabajador',
        'idEstudiante2',
      ],
      order: { fechaEntrega: 'DESC' },
    });

    return {
      success: true,
      message: 'Entregas del estudiante obtenidas correctamente',
      entregas,
    };
  }

  async findByEstado(estado: string): Promise<{
    success: boolean;
    message: string;
    entregas: TareaEntrega[];
  }> {
    const entregas = await this.tareaEntregaRepository.find({
      where: { estado },
      relations: [
        'idTarea2',
        'idTarea2.aula',
        'idTarea2.aula.idGrado',
        'idTarea2.idTrabajador',
        'idEstudiante2',
      ],
      order: { fechaEntrega: 'DESC' },
    });

    return {
      success: true,
      message: `Entregas en estado "${estado}" obtenidas correctamente`,
      entregas,
    };
  }

  async findByAula(idAula: string): Promise<{
    success: boolean;
    message: string;
    entregas: TareaEntrega[];
  }> {
    const entregas = await this.tareaEntregaRepository
      .createQueryBuilder('entrega')
      .leftJoinAndSelect('entrega.idTarea2', 'tarea')
      .leftJoinAndSelect('tarea.aula', 'aula')
      .leftJoinAndSelect('entrega.idEstudiante2', 'estudiante')
      .leftJoinAndSelect('tarea.idTrabajador', 'trabajador')
      .where('aula.idAula = :idAula', { idAula })
      .orderBy('entrega.fechaEntrega', 'DESC')
      .getMany();

    return {
      success: true,
      message: 'Entregas del aula obtenidas correctamente',
      entregas,
    };
  }

  async marcarComoRevisado(
    id: string,
    observacionesDocente: string,
  ): Promise<{
    success: boolean;
    message: string;
    entrega: TareaEntrega;
  }> {
    const entrega = await this.findOne(id);

    // Verificar que la entrega esté en estado "entregado" o "tarde"
    if (!['entregado', 'tarde'].includes(entrega.estado || '')) {
      throw new BadRequestException(
        'Solo se pueden revisar entregas que estén en estado "entregado" o "tarde"',
      );
    }

    await this.tareaEntregaRepository.update(id, {
      estado: 'revisado',
      observaciones: observacionesDocente,
    });

    const entregaActualizada = await this.findOne(id);

    return {
      success: true,
      message: 'Entrega marcada como revisada correctamente',
      entrega: entregaActualizada,
    };
  }

  async obtenerEntregasPendientesPorVencer(): Promise<{
    success: boolean;
    message: string;
    entregas: TareaEntrega[];
  }> {
    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + 2); // Próximas 48 horas

    const entregas = await this.tareaEntregaRepository
      .createQueryBuilder('entrega')
      .leftJoinAndSelect('entrega.idTarea2', 'tarea')
      .leftJoinAndSelect('entrega.idEstudiante2', 'estudiante')
      .leftJoinAndSelect('tarea.aula', 'aula')
      .where('entrega.estado = :estado', { estado: 'pendiente' })
      .andWhere('tarea.fechaEntrega BETWEEN :fechaActual AND :fechaLimite', {
        fechaActual: fechaActual.toISOString().split('T')[0],
        fechaLimite: fechaLimite.toISOString().split('T')[0],
      })
      .orderBy('tarea.fechaEntrega', 'ASC')
      .getMany();

    return {
      success: true,
      message: 'Entregas pendientes por vencer obtenidas correctamente',
      entregas,
    };
  }

  async generarReporteTarea(idTarea: string): Promise<{
    success: boolean;
    message: string;
    reporte: {
      tarea: any;
      estadisticas: any;
      detalleEstudiantes: any[];
    };
  }> {
    const resultadoEntregas = await this.findByTarea(idTarea);

    if (resultadoEntregas.entregas.length === 0) {
      throw new NotFoundException('No se encontraron entregas para esta tarea');
    }

    const tarea = resultadoEntregas.entregas[0].idTarea2;

    const detalleEstudiantes = resultadoEntregas.entregas.map((entrega) => ({
      estudiante: {
        id: entrega.idEstudiante,
        nombre: `${entrega.idEstudiante2.nombre} ${entrega.idEstudiante2.apellido}`,
      },
      entrega: {
        realizo: entrega.realizoTarea,
        estado: entrega.estado,
        fechaEntrega: entrega.fechaEntrega,
        observaciones: entrega.observaciones,
        tieneArchivo: !!entrega.archivoUrl,
      },
    }));

    return {
      success: true,
      message: 'Reporte de tarea generado correctamente',
      reporte: {
        tarea: {
          id: tarea.idTarea,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          fechaLimite: tarea.fechaEntrega,
          aula: tarea.aula?.seccion || 'N/A',
        },
        estadisticas: resultadoEntregas.estadisticas,
        detalleEstudiantes,
      },
    };
  }
}
