// En src/tarea/tarea.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tarea } from './entities/tarea.entity';
import { TareaEntrega } from '../tarea-entrega/entities/tarea-entrega.entity';
import { Repository, DataSource } from 'typeorm';
import { AulaService } from '../aula/aula.service';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { MatriculaAulaService } from '../matricula-aula/matricula-aula.service';

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(TareaEntrega)
    private readonly tareaEntregaRepository: Repository<TareaEntrega>,
    private readonly aulaService: AulaService,
    private readonly trabajadorService: TrabajadorService,
    private readonly matriculaAulaService: MatriculaAulaService,
    private readonly dataSource: DataSource,
  ) { }

  async create(createTareaDto: CreateTareaDto): Promise<any> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. VALIDAR AULA (usando tu método existente)
      const aula = await this.aulaService.findOne(createTareaDto.idAula);
      if (!aula) {
        throw new NotFoundException('Aula no encontrada');
      }

      // 2. VALIDAR TRABAJADOR (usando tu método existente)
      const trabajador = await this.trabajadorService.findOne(
        createTareaDto.idTrabajador,
      );
      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // 3. VALIDAR QUE EL TRABAJADOR SEA DOCENTE (usando tu enum de roles)
      if (trabajador.idRol.nombre !== 'DOCENTE') {
        throw new BadRequestException(
          'Solo los docentes pueden asignar tareas',
        );
      }

      //VALIDAR QUE EL DOCENTE SEA DEL MISMO AULA PARA QUE ASIGNE LA TAREA
      const asignaciones = await this.aulaService.getAsignacionesDeAula(aula.idAula);
      if (!asignaciones.some(asignacion => asignacion.idTrabajador.idTrabajador === trabajador.idTrabajador)) {
        throw new BadRequestException('El docente no está asignado al aula');
      }

      // 4. VALIDAR FECHA DE ENTREGA
      const fechaActual = new Date();
      const fechaEntrega = new Date(createTareaDto.fechaEntrega);

      if (fechaEntrega < fechaActual) {
        throw new BadRequestException(
          'La fecha de entrega no puede ser anterior a la fecha actual',
        );
      }

      // 5. CREAR LA TAREA
      const tarea = manager.create(Tarea, {
        titulo: createTareaDto.titulo,
        descripcion: createTareaDto.descripcion || null,
        fechaEntrega: createTareaDto.fechaEntrega,
        estado: createTareaDto.estado || 'pendiente',
        aula: { idAula: createTareaDto.idAula },
        idTrabajador: { idTrabajador: createTareaDto.idTrabajador },
      });

      const tareaGuardada = await manager.save(Tarea, tarea);

      // 6. OBTENER ESTUDIANTES DEL AULA (usando tu método existente)
      const estudiantesAula =
        await this.matriculaAulaService.obtenerEstudiantesDelAula(
          createTareaDto.idAula,
        );

      // 7. CREAR ENTREGAS AUTOMÁTICAMENTE PARA CADA ESTUDIANTE
      const entregasCreadas: TareaEntrega[] = [];
      for (const estudianteAula of estudiantesAula) {
        // Verificar si ya existe una entrega para este estudiante y esta tarea
        const entregaExistente = await manager.findOne(TareaEntrega, {
          where: {
            idTarea: tareaGuardada.idTarea,
            idEstudiante: estudianteAula.matricula.idEstudiante.idEstudiante,
          },
        });

        // Solo crear la entrega si no existe
        if (!entregaExistente) {
          const tareaEntrega = manager.create(TareaEntrega, {
            idTarea: tareaGuardada.idTarea,
            idEstudiante: estudianteAula.matricula.idEstudiante.idEstudiante,
            estado: 'pendiente',
            fechaEntrega: createTareaDto.fechaEntrega,
          });

          const entregaGuardada = await manager.save(TareaEntrega, tareaEntrega);
          entregasCreadas.push(entregaGuardada);
        }
      }

      // 8. CARGAR TAREA COMPLETA CON RELACIONES
      const tareaCompleta = await manager.findOne(Tarea, {
        where: { idTarea: tareaGuardada.idTarea },
        relations: [
          'aula',
          'aula.idGrado',
          'idTrabajador',
          'idTrabajador.idRol',
          'tareaEntregas',
          'tareaEntregas.idEstudiante2',
        ],
      });

      return {
        success: true,
        message: `Tarea "${createTareaDto.titulo}" creada y asignada a ${entregasCreadas.length} estudiantes del aula ${aula.seccion}`,
        tarea: tareaCompleta,
        entregasCreadas: entregasCreadas.length,
        estudiantesAsignados: estudiantesAula.map((ea) => ({
          idEstudiante: ea.matricula.idEstudiante.idEstudiante,
          nombre: `${ea.matricula.idEstudiante.nombre} ${ea.matricula.idEstudiante.apellido}`,
        })),
      };
    });
  }

  // Método complementario que necesitarás
  async findOne(id: string): Promise<Tarea | null> {
    return await this.tareaRepository.findOne({
      where: { idTarea: id },
      relations: [
        'aula',
        'aula.idGrado',
        'idTrabajador',
        'idTrabajador.idRol',
        'tareaEntregas',
        'tareaEntregas.idEstudiante2',
      ],
    });
  }

  async findByAula(idAula: string): Promise<{
    success: boolean;
    message: string;
    tareas: Tarea[];
  }> {
    // Verificar que el aula existe
    const aula = await this.aulaService.findOne(idAula);
    if (!aula) {
      throw new NotFoundException('Aula no encontrada');
    }

    const tareas = await this.tareaRepository
      .createQueryBuilder('tarea')
      .leftJoinAndSelect('tarea.aula', 'aula')
      .leftJoinAndSelect('aula.idGrado', 'grado')
      .where('aula.idAula = :aulaId', { aulaId: aula.idAula })
      .orderBy('tarea.fechaAsignacion', 'DESC')
      .getMany();

    return {
      success: true,
      message: `Tareas del aula ${aula.seccion}${aula.idGrado ? ` - ${aula.idGrado.grado}` : ''} obtenidas correctamente`,
      tareas,
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    tareas: Tarea[];
  }> {
    const tareas = await this.tareaRepository.find({
      relations: [
        'aula',
        'aula.idGrado',
        'idTrabajador',
        'idTrabajador.idRol',
        'tareaEntregas',
        'tareaEntregas.idEstudiante2',
      ],
      order: { fechaAsignacion: 'DESC' },
    });

    return {
      success: true,
      message: 'Tareas obtenidas correctamente',
      tareas,
    };
  }

  async update(
    id: string,
    updateTareaDto: UpdateTareaDto,
  ): Promise<{
    success: boolean;
    message: string;
    tarea: Tarea;
    cambiosRealizados: string[];
  }> {
    // 1. Verificar que la tarea existe
    const tarea = await this.findOne(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    // 2. Verificar que el trabajador puede editar esta tarea (solo el creador o un administrador)
    if (
      updateTareaDto.idTrabajador &&
      updateTareaDto.idTrabajador !== tarea.idTrabajador.idTrabajador
    ) {
      const nuevoTrabajador = await this.trabajadorService.findOne(
        updateTareaDto.idTrabajador,
      );
      if (!nuevoTrabajador) {
        throw new NotFoundException('El nuevo trabajador asignado no existe');
      }
      if (nuevoTrabajador.idRol.nombre !== 'DOCENTE') {
        throw new BadRequestException(
          'Solo los docentes pueden ser asignados a tareas',
        );
      }
    }

    // 3. Validar nueva aula si se cambia
    if (updateTareaDto.idAula && updateTareaDto.idAula !== tarea.aula.idAula) {
      const nuevaAula = await this.aulaService.findOne(updateTareaDto.idAula);
      if (!nuevaAula) {
        throw new NotFoundException('La nueva aula asignada no existe');
      }
    }

    // 4. Validar fecha de entrega si se cambia
    if (updateTareaDto.fechaEntrega) {
      const nuevaFechaEntrega = new Date(updateTareaDto.fechaEntrega);
      const fechaActual = new Date();

      if (nuevaFechaEntrega < fechaActual) {
        throw new BadRequestException(
          'La nueva fecha de entrega no puede ser anterior a la fecha actual',
        );
      }
    }

    // 5. Verificar si hay entregas realizadas que podrían verse afectadas
    const entregasRealizadas = await this.tareaEntregaRepository.count({
      where: {
        idTarea: id,
        realizoTarea: true,
      },
    });

    if (
      entregasRealizadas > 0 &&
      (updateTareaDto.fechaEntrega || updateTareaDto.idAula)
    ) {
      throw new ConflictException(
        `No se puede modificar la fecha de entrega o el aula porque ya hay ${entregasRealizadas} entregas realizadas`,
      );
    }

    const cambiosRealizados: string[] = [];

    return await this.dataSource.transaction(async (manager) => {
      // 6. Actualizar la tarea
      const updateData: any = {};

      if (updateTareaDto.titulo && updateTareaDto.titulo !== tarea.titulo) {
        updateData.titulo = updateTareaDto.titulo;
        cambiosRealizados.push(
          `Título actualizado: "${tarea.titulo}" → "${updateTareaDto.titulo}"`,
        );
      }

      if (
        updateTareaDto.descripcion !== undefined &&
        updateTareaDto.descripcion !== tarea.descripcion
      ) {
        updateData.descripcion = updateTareaDto.descripcion;
        cambiosRealizados.push('Descripción actualizada');
      }

      if (
        updateTareaDto.fechaEntrega &&
        updateTareaDto.fechaEntrega !== tarea.fechaEntrega
      ) {
        updateData.fechaEntrega = updateTareaDto.fechaEntrega;
        cambiosRealizados.push(
          `Fecha de entrega actualizada: ${tarea.fechaEntrega} → ${updateTareaDto.fechaEntrega}`,
        );

        // Actualizar fecha en todas las entregas pendientes
        await manager.update(
          TareaEntrega,
          { idTarea: id, realizoTarea: false },
          { fechaEntrega: updateTareaDto.fechaEntrega },
        );
        cambiosRealizados.push(
          'Fechas de entrega actualizadas en entregas pendientes',
        );
      }

      if (updateTareaDto.estado && updateTareaDto.estado !== tarea.estado) {
        updateData.estado = updateTareaDto.estado;
        cambiosRealizados.push(
          `Estado actualizado: ${tarea.estado} → ${updateTareaDto.estado}`,
        );
      }

      if (
        updateTareaDto.idAula &&
        updateTareaDto.idAula !== tarea.aula.idAula
      ) {
        updateData.aula = { idAula: updateTareaDto.idAula };
        cambiosRealizados.push('Aula asignada actualizada');
      }

      if (
        updateTareaDto.idTrabajador &&
        updateTareaDto.idTrabajador !== tarea.idTrabajador.idTrabajador
      ) {
        updateData.idTrabajador = { idTrabajador: updateTareaDto.idTrabajador };
        cambiosRealizados.push('Docente asignado actualizado');
      }

      if (Object.keys(updateData).length > 0) {
        await manager.update(Tarea, id, updateData);
      }

      // 7. Obtener tarea actualizada
      const tareaActualizada = await manager.findOne(Tarea, {
        where: { idTarea: id },
        relations: [
          'aula',
          'aula.idGrado',
          'idTrabajador',
          'idTrabajador.idRol',
          'tareaEntregas',
          'tareaEntregas.idEstudiante2',
        ],
      });

      return {
        success: true,
        message:
          cambiosRealizados.length > 0
            ? `Tarea actualizada correctamente. ${cambiosRealizados.length} cambios realizados.`
            : 'No se realizaron cambios en la tarea',
        tarea: tareaActualizada!,
        cambiosRealizados,
      };
    });
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
    entregasEliminadas: number;
  }> {
    // 1. Verificar que la tarea existe
    const tarea = await this.findOne(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    // 2. Contar entregas realizadas para informar al usuario
    const entregasRealizadas = await this.tareaEntregaRepository.count({
      where: {
        idTarea: id,
        realizoTarea: true,
      },
    });

    if (entregasRealizadas > 0) {
      throw new ConflictException(
        `No se puede eliminar la tarea porque ya tiene ${entregasRealizadas} entregas realizadas por estudiantes`,
      );
    }

    // 3. Contar total de entregas que se eliminarán
    const totalEntregas = await this.tareaEntregaRepository.count({
      where: { idTarea: id },
    });

    return await this.dataSource.transaction(async (manager) => {
      // 4. Eliminar la tarea (las entregas se eliminan automáticamente por CASCADE)
      await manager.delete(Tarea, id);

      return {
        success: true,
        message: `Tarea "${tarea.titulo}" eliminada correctamente`,
        entregasEliminadas: totalEntregas,
      };
    });
  }

  async findByEstado(estado: string): Promise<{
    success: boolean;
    message: string;
    tareas: Tarea[];
  }> {
    const tareas = await this.tareaRepository.find({
      where: { estado },
      relations: [
        'aula',
        'aula.idGrado',
        'idTrabajador',
        'idTrabajador.idRol',
        'tareaEntregas',
      ],
      order: { fechaAsignacion: 'DESC' },
    });

    return {
      success: true,
      message: `Tareas en estado "${estado}" obtenidas correctamente`,
      tareas,
    };
  }

  async findByTrabajador(idTrabajador: string): Promise<{
    success: boolean;
    message: string;
    tareas: Tarea[];
  }> {
    // Verificar que el trabajador existe
    const trabajador = await this.trabajadorService.findOne(idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    const tareas = await this.tareaRepository
      .createQueryBuilder('tarea')
      .leftJoinAndSelect('tarea.aula', 'aula')
      .leftJoinAndSelect('aula.idGrado', 'grado')
      .leftJoinAndSelect('tarea.idTrabajador', 'trabajador')
      .leftJoinAndSelect('trabajador.idRol', 'rol')
      .leftJoinAndSelect('tarea.tareaEntregas', 'tareaEntregas')
      .leftJoinAndSelect('tareaEntregas.idEstudiante2', 'estudiante')
      .where('tarea.idTrabajador = :trabajadorId', { trabajadorId: trabajador.idTrabajador })
      .orderBy('tarea.fechaAsignacion', 'DESC')
      .getMany();

    return {
      success: true,
      message: `Tareas del trabajador ${trabajador.nombre} ${trabajador.apellido} obtenidas correctamente`,
      tareas,
    };
  }

  async obtenerEstadisticasTarea(id: string): Promise<{
    success: boolean;
    message: string;
    tarea: Tarea;
    estadisticas: {
      totalEstudiantes: number;
      entregasRealizadas: number;
      entregasPendientes: number;
      porcentajeCompletado: number;
      estudiantesConEntrega: any[];
      estudiantesSinEntrega: any[];
    };
  }> {
    const tarea = await this.findOne(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    const totalEstudiantes = tarea.tareaEntregas.length;
    const entregasRealizadas = tarea.tareaEntregas.filter(
      (entrega) => entrega.realizoTarea,
    ).length;
    const entregasPendientes = totalEstudiantes - entregasRealizadas;
    const porcentajeCompletado =
      totalEstudiantes > 0
        ? Math.round((entregasRealizadas / totalEstudiantes) * 100)
        : 0;

    const estudiantesConEntrega = tarea.tareaEntregas
      .filter((entrega) => entrega.realizoTarea)
      .map((entrega) => ({
        idEstudiante: entrega.idEstudiante,
        nombreEstudiante: `${entrega.idEstudiante2.nombre} ${entrega.idEstudiante2.apellido}`,
        fechaEntrega: entrega.fechaEntrega,
        observaciones: entrega.observaciones,
        archivoUrl: entrega.archivoUrl,
      }));

    const estudiantesSinEntrega = tarea.tareaEntregas
      .filter((entrega) => !entrega.realizoTarea)
      .map((entrega) => ({
        idEstudiante: entrega.idEstudiante,
        nombreEstudiante: `${entrega.idEstudiante2.nombre} ${entrega.idEstudiante2.apellido}`,
      }));

    return {
      success: true,
      message: 'Estadísticas de la tarea obtenidas correctamente',
      tarea,
      estadisticas: {
        totalEstudiantes,
        entregasRealizadas,
        entregasPendientes,
        porcentajeCompletado,
        estudiantesConEntrega,
        estudiantesSinEntrega,
      },
    };
  }
}
