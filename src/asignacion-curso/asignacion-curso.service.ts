import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAsignacionCursoDto } from './dto/create-asignacion-curso.dto';
import { UpdateAsignacionCursoDto } from './dto/update-asignacion-curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AsignacionCurso } from './entities/asignacion-curso.entity';
import { Repository, Not } from 'typeorm';
import { CursoService } from 'src/curso/curso.service';
import { TrabajadorService } from 'src/trabajador/trabajador.service';

@Injectable()
export class AsignacionCursoService {
  constructor(
    @InjectRepository(AsignacionCurso)
    private readonly asignacionCursoRepository: Repository<AsignacionCurso>,
    private readonly cursoService: CursoService,
    private readonly trabajadorService: TrabajadorService
  ) { }

  async create(createAsignacionCursoDto: CreateAsignacionCursoDto): Promise<{ success: boolean; message: string; asignacionCurso: AsignacionCurso }> {
    //1. verificar curso activo 
    const cursoEncontrado = await this.cursoService.findOne(createAsignacionCursoDto.idCurso);

    if (!cursoEncontrado) {
      throw new NotFoundException(`Curso con ID ${createAsignacionCursoDto.idCurso} no encontrado o inactivo`);
    }

    //2. verificar que el trabajador existe
    const trabajadorEncontrado = await this.trabajadorService.findOne(createAsignacionCursoDto.idTrabajador);
    if (!trabajadorEncontrado) {
      throw new NotFoundException(`Trabajador con ID ${createAsignacionCursoDto.idTrabajador} no encontrado o inactivo`);
    }

    if (trabajadorEncontrado.idRol.nombre !== 'DOCENTE') {
      throw new NotFoundException(`El trabajador con ID ${createAsignacionCursoDto.idTrabajador} no tiene el rol de DOCENTE`);
    }

    //3 verificar si ya existe asignacion activa del trabajador mismo con curso mismo
    const asignacionExistente = await this.findAsignacionActiva(
      createAsignacionCursoDto.idCurso,
      createAsignacionCursoDto.idTrabajador
    );

    if (asignacionExistente) {
      throw new NotFoundException(`El trabajador con ID ${createAsignacionCursoDto.idTrabajador} ya tiene una asignación activa para el curso con ID ${createAsignacionCursoDto.idCurso}`);
    }

    //4. Crear asignacion

    const asignacionCurso = this.asignacionCursoRepository.create({
      fechaAsignacion: createAsignacionCursoDto.fechaAsignacion,
      estaActivo: true,
      idCurso: { idCurso: createAsignacionCursoDto.idCurso },
      idTrabajador: { idTrabajador: createAsignacionCursoDto.idTrabajador }
    });

    const asignacionGuardada = await this.asignacionCursoRepository.save(asignacionCurso);

    return {
      success: true,
      message: 'Asignación de curso creada correctamente',
      asignacionCurso: asignacionGuardada,
    };
  }

  async findAsignacionActiva(idCurso: string, idTrabajador: string): Promise<AsignacionCurso | null> {
    return await this.asignacionCursoRepository
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.idCurso', 'curso')
      .leftJoinAndSelect('asignacion.idTrabajador', 'trabajador')
      .where('curso.idCurso = :idCurso', { idCurso })
      .andWhere('trabajador.idTrabajador = :idTrabajador', { idTrabajador })
      .andWhere('asignacion.estaActivo = :estaActivo', { estaActivo: true })
      .getOne();
  }

  // Obtener cursos asignados a un trabajador específico
  async getCursosByTrabajador(idTrabajador: string): Promise<any> {
    const asignaciones = await this.asignacionCursoRepository.find({
      where: {
        idTrabajador: { idTrabajador },
        estaActivo: true
      },
      relations: ['idCurso', 'idTrabajador']
    });

    return {
      success: true,
      message: 'Cursos del trabajador obtenidos correctamente',
      data: asignaciones
    };
  }

  // Obtener trabajadores asignados a un curso específico  
  async getTrabajadoresByCurso(idCurso: string): Promise<any> {
    const asignaciones = await this.asignacionCursoRepository.find({
      where: {
        idCurso: { idCurso },
        estaActivo: true
      },
      relations: ['idCurso', 'idTrabajador', 'idTrabajador.idRol']
    });

    return {
      success: true,
      message: 'Trabajadores del curso obtenidos correctamente',
      data: asignaciones
    };
  }

  // Reasignar curso (desactivar asignación actual y crear nueva)
  async reasignarCurso(idCurso: string, nuevoIdTrabajador: string): Promise<any> {
    // Desactivar asignaciones actuales del curso
    await this.asignacionCursoRepository.update(
      { idCurso: { idCurso }, estaActivo: true },
      { estaActivo: false }
    );

    // Crear nueva asignación
    return await this.create({
      idCurso,
      idTrabajador: nuevoIdTrabajador,
      fechaAsignacion: new Date().toISOString().split('T')[0],
      estaActivo: true
    });
  }

  async buscarAsignaciones(filtros: {
    idCurso?: string;
    idTrabajador?: string;
    estaActivo?: boolean;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<any> {
    const queryBuilder = this.asignacionCursoRepository
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.idCurso', 'curso')
      .leftJoinAndSelect('asignacion.idTrabajador', 'trabajador')
      .leftJoinAndSelect('trabajador.idRol', 'rol');

    if (filtros.idCurso) {
      queryBuilder.andWhere('curso.idCurso = :idCurso', { idCurso: filtros.idCurso });
    }

    if (filtros.idTrabajador) {
      queryBuilder.andWhere('trabajador.idTrabajador = :idTrabajador', { idTrabajador: filtros.idTrabajador });
    }

    if (filtros.estaActivo !== undefined) {
      queryBuilder.andWhere('asignacion.estaActivo = :estaActivo', { estaActivo: filtros.estaActivo });
    }

    if (filtros.fechaDesde) {
      queryBuilder.andWhere('asignacion.fechaAsignacion >= :fechaDesde', { fechaDesde: filtros.fechaDesde });
    }

    if (filtros.fechaHasta) {
      queryBuilder.andWhere('asignacion.fechaAsignacion <= :fechaHasta', { fechaHasta: filtros.fechaHasta });
    }

    const asignaciones = await queryBuilder.getMany();

    return {
      success: true,
      message: 'Búsqueda de asignaciones completada',
      data: asignaciones,
      total: asignaciones.length
    };
  }

  async findAll(): Promise<{ success: boolean; message: string; asignacionesCurso: AsignacionCurso[] }> {
    const asignacionesCurso = await this.asignacionCursoRepository.find({
      relations: ['idCurso', 'idTrabajador'],
    });
    return {
      success: true,
      message: 'Asignaciones de curso encontradas correctamente',
      asignacionesCurso,
    };
  }

  async findOne(id: string): Promise<AsignacionCurso> {
    const asignacionCurso = await this.asignacionCursoRepository.findOne({
      where: { idAsignacionCurso: id },
      relations: ['idCurso', 'idTrabajador'],
    });
    if (!asignacionCurso) {
      throw new NotFoundException(`Asignación de curso con ID ${id} no encontrada`);
    }
    return asignacionCurso;
  }

  async update(id: string, updateAsignacionCursoDto: UpdateAsignacionCursoDto): Promise<{ success: boolean; message: string; asignacionCurso: AsignacionCurso }> {
    const asignacionCurso = await this.findOne(id);

    // Validaciones cuando se actualiza el curso
    if (updateAsignacionCursoDto.idCurso !== undefined) {
      const cursoEncontrado = await this.cursoService.findOne(updateAsignacionCursoDto.idCurso);
      if (!cursoEncontrado) {
        throw new NotFoundException(`Curso con ID ${updateAsignacionCursoDto.idCurso} no encontrado o inactivo`);
      }
    }

    // Validaciones cuando se actualiza el trabajador
    if (updateAsignacionCursoDto.idTrabajador !== undefined) {
      const trabajadorEncontrado = await this.trabajadorService.findOne(updateAsignacionCursoDto.idTrabajador);
      if (!trabajadorEncontrado) {
        throw new NotFoundException(`Trabajador con ID ${updateAsignacionCursoDto.idTrabajador} no encontrado o inactivo`);
      }

      if (trabajadorEncontrado.idRol.nombre !== 'DOCENTE') {
        throw new NotFoundException(`El trabajador con ID ${updateAsignacionCursoDto.idTrabajador} no tiene el rol de DOCENTE`);
      }

      // Solo validar duplicados si se está cambiando el trabajador o el curso
      const cursoId = updateAsignacionCursoDto.idCurso || asignacionCurso.idCurso.idCurso;
      const trabajadorId = updateAsignacionCursoDto.idTrabajador;

      // Solo verificar si es diferente del trabajador actual
      if (trabajadorId !== asignacionCurso.idTrabajador.idTrabajador ||
        (updateAsignacionCursoDto.idCurso && updateAsignacionCursoDto.idCurso !== asignacionCurso.idCurso.idCurso)) {

        const asignacionExistente = await this.findAsignacionActiva(cursoId, trabajadorId);

        if (asignacionExistente) {
          throw new NotFoundException(`El trabajador con ID ${trabajadorId} ya tiene una asignación activa para el curso con ID ${cursoId}`);
        }
      }
    }

    const updateData: any = {};
    if (updateAsignacionCursoDto.fechaAsignacion !== undefined) {
      updateData.fechaAsignacion = updateAsignacionCursoDto.fechaAsignacion;
    }
    if (updateAsignacionCursoDto.estaActivo !== undefined) {
      updateData.estaActivo = updateAsignacionCursoDto.estaActivo;
    }
    if (updateAsignacionCursoDto.idCurso !== undefined) {
      updateData.idCurso = { idCurso: updateAsignacionCursoDto.idCurso };
    }
    if (updateAsignacionCursoDto.idTrabajador !== undefined) {
      updateData.idTrabajador = { idTrabajador: updateAsignacionCursoDto.idTrabajador };
    }

    await this.asignacionCursoRepository.update({ idAsignacionCurso: id }, updateData);
    const updatedAsignacionCurso = await this.findOne(id);
    return {
      success: true,
      message: 'Asignación de curso actualizada correctamente',
      asignacionCurso: updatedAsignacionCurso,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const asignacionCurso = await this.findOne(id);
    if (asignacionCurso) {
      await this.asignacionCursoRepository.update(
        { idAsignacionCurso: id },
        { estaActivo: false }
      );
    }
    return {
      message: `Asignación de curso desactivada correctamente`,
    };
  }
}
