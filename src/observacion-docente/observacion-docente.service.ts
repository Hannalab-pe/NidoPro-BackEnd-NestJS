import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateObservacionDocenteDto } from './dto/create-observacion-docente.dto';
import { UpdateObservacionDocenteDto } from './dto/update-observacion-docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ObservacionDocente } from './entities/observacion-docente.entity';
import { Bimestre } from '../bimestre/entities/bimestre.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { Repository } from 'typeorm';
import { EstadoObservacionDocente } from '../enums/estado-observacion-docente.enum';
import { TipoObservacionDocente } from '../enums/tipo-observacion-docente.enum';

@Injectable()
export class ObservacionDocenteService {

  constructor(
    @InjectRepository(ObservacionDocente)
    private readonly observacionRepository: Repository<ObservacionDocente>,
    @InjectRepository(Bimestre)
    private readonly bimestreRepository: Repository<Bimestre>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>
  ) { }

  // Solo coordinadores pueden crear observaciones
  async create(createObservacionDocenteDto: CreateObservacionDocenteDto, coordinadorId: string): Promise<{ success: boolean; message: string; observacion: ObservacionDocente }> {

    // Validar que el coordinador existe y tiene el rol adecuado
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador) {
      throw new NotFoundException('Coordinador no encontrado');
    }

    // Verificar que sea coordinador (puedes ajustar esta validación según tu enum de roles)
    if (coordinador.idRol.nombre !== 'COORDINADOR') {
      throw new ForbiddenException('Solo los coordinadores pueden crear observaciones');
    }

    // Validar que el bimestre existe y está activo
    const bimestre = await this.bimestreRepository.findOne({
      where: { idBimestre: createObservacionDocenteDto.idBimestre }
    });

    if (!bimestre) {
      throw new NotFoundException('El bimestre especificado no existe');
    }

    if (!bimestre.estaActivo) {
      throw new BadRequestException('No se pueden crear observaciones para un bimestre inactivo');
    }

    // Validar que el trabajador observado existe
    const trabajadorObservado = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createObservacionDocenteDto.idTrabajador }
    });

    if (!trabajadorObservado) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    if (!trabajadorObservado.estaActivo) {
      throw new BadRequestException('El trabajador no está activo');
    }

    // Crear la observación
    const observacion = this.observacionRepository.create({
      ...createObservacionDocenteDto,
      estado: createObservacionDocenteDto.estado || EstadoObservacionDocente.ACTIVA,
      fechaObservacion: createObservacionDocenteDto.fechaObservacion || new Date().toISOString().split('T')[0],
      idCoordinador: coordinador,
      idTrabajador: trabajadorObservado,
      idBimestre: bimestre
    });

    const savedObservacion = await this.observacionRepository.save(observacion);

    return {
      success: true,
      message: 'Observación docente creada correctamente',
      observacion: savedObservacion
    };
  }

  // Método para cambiar estado de observación (solo coordinadores)
  async cambiarEstado(
    id: string,
    nuevoEstado: EstadoObservacionDocente,
    coordinadorId: string,
    observaciones?: string
  ): Promise<{ success: boolean; message: string; observacion: ObservacionDocente }> {

    const observacion = await this.findOne(id);

    // Validar que quien hace el cambio es coordinador
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador || coordinador.idRol.nombre !== 'COORDINADOR') {
      throw new ForbiddenException('Solo los coordinadores pueden cambiar el estado de observaciones');
    }

    // Validar transiciones de estado permitidas
    const transicionesPermitidas: Record<EstadoObservacionDocente, EstadoObservacionDocente[]> = {
      [EstadoObservacionDocente.ACTIVA]: [EstadoObservacionDocente.PENDIENTE_REVISION, EstadoObservacionDocente.CERRADA],
      [EstadoObservacionDocente.PENDIENTE_REVISION]: [EstadoObservacionDocente.APROBADO, EstadoObservacionDocente.ACTIVA],
      [EstadoObservacionDocente.APROBADO]: [EstadoObservacionDocente.CALIFICADO],
      [EstadoObservacionDocente.CALIFICADO]: [EstadoObservacionDocente.CERRADA],
      [EstadoObservacionDocente.SUBSANADA]: [EstadoObservacionDocente.CERRADA],
      [EstadoObservacionDocente.CERRADA]: [] // Estado final
    };

    const estadoActual = observacion.estado as EstadoObservacionDocente;
    if (!transicionesPermitidas[estadoActual]?.includes(nuevoEstado)) {
      throw new BadRequestException(`No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}`);
    }

    // Actualizar observación
    const updateData: any = {
      estado: nuevoEstado
    };

    if (nuevoEstado === EstadoObservacionDocente.SUBSANADA) {
      updateData.fechaSubsanacion = new Date().toISOString().split('T')[0];
    }

    if (observaciones) {
      updateData.descripcion = `${observacion.descripcion}\n\nActualización: ${observaciones}`;
    }

    await this.observacionRepository.update(id, updateData);
    const updatedObservacion = await this.findOne(id);

    return {
      success: true,
      message: `Estado cambiado a ${nuevoEstado} correctamente`,
      observacion: updatedObservacion
    };
  }

  // Método para marcar como calificado (llamado desde evaluación docente bimestral)
  async marcarComoCalificado(idTrabajador: string, idBimestre: string): Promise<void> {
    const observaciones = await this.observacionRepository.find({
      where: {
        idTrabajador: { idTrabajador },
        idBimestre: { idBimestre },
        estado: EstadoObservacionDocente.APROBADO
      }
    });

    if (observaciones.length > 0) {
      await this.observacionRepository.update(
        { idObservacionDocente: observaciones.map(o => o.idObservacionDocente) as any },
        { estado: EstadoObservacionDocente.CALIFICADO }
      );
    }
  }

  async findAll(): Promise<{ success: boolean; message: string; observaciones: ObservacionDocente[] }> {
    const observaciones = await this.observacionRepository.find({
      relations: ['idBimestre', 'idCoordinador', 'idTrabajador'],
      order: { fechaObservacion: 'DESC' }
    });

    return {
      success: true,
      message: 'Observaciones encontradas correctamente',
      observaciones
    };
  }

  async findByTrabajador(idTrabajador: string): Promise<{ success: boolean; message: string; observaciones: ObservacionDocente[] }> {
    const observaciones = await this.observacionRepository.find({
      where: { idTrabajador: { idTrabajador } },
      relations: ['idBimestre', 'idCoordinador', 'idTrabajador'],
      order: { fechaObservacion: 'DESC' }
    });

    return {
      success: true,
      message: 'Observaciones del trabajador encontradas correctamente',
      observaciones
    };
  }

  async findByBimestre(idBimestre: string): Promise<{ success: boolean; message: string; observaciones: ObservacionDocente[] }> {
    const observaciones = await this.observacionRepository.find({
      where: { idBimestre: { idBimestre } },
      relations: ['idBimestre', 'idCoordinador', 'idTrabajador'],
      order: { fechaObservacion: 'DESC' }
    });

    return {
      success: true,
      message: 'Observaciones del bimestre encontradas correctamente',
      observaciones
    };
  }

  async findByEstado(estado: EstadoObservacionDocente): Promise<{ success: boolean; message: string; observaciones: ObservacionDocente[] }> {
    const observaciones = await this.observacionRepository.find({
      where: { estado },
      relations: ['idBimestre', 'idCoordinador', 'idTrabajador'],
      order: { fechaObservacion: 'DESC' }
    });

    return {
      success: true,
      message: `Observaciones en estado ${estado} encontradas correctamente`,
      observaciones
    };
  }

  async findOne(id: string): Promise<ObservacionDocente> {
    const observacion = await this.observacionRepository.findOne({
      where: { idObservacionDocente: id },
      relations: ['idBimestre', 'idCoordinador', 'idTrabajador']
    });

    if (!observacion) {
      throw new NotFoundException(`Observación docente con ID ${id} no encontrada`);
    }

    return observacion;
  }

  async update(id: string, updateObservacionDocenteDto: UpdateObservacionDocenteDto, coordinadorId: string): Promise<{ success: boolean; message: string; observacion: ObservacionDocente }> {

    const observacion = await this.findOne(id);

    // Validar que quien actualiza es coordinador
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador || coordinador.idRol.nombre !== 'COORDINADOR') {
      throw new ForbiddenException('Solo los coordinadores pueden actualizar observaciones');
    }

    // Solo permitir edición si no está cerrada o calificada
    if ([EstadoObservacionDocente.CERRADA, EstadoObservacionDocente.CALIFICADO].includes(observacion.estado as EstadoObservacionDocente)) {
      throw new BadRequestException('No se pueden editar observaciones cerradas o calificadas');
    }

    // Crear objeto de actualización excluyendo campos que no se pueden actualizar directamente
    const { idBimestre, idTrabajador, idCoordinador, ...updateFields } = updateObservacionDocenteDto;

    await this.observacionRepository.update(id, updateFields);
    const updatedObservacion = await this.findOne(id);

    return {
      success: true,
      message: 'Observación docente actualizada correctamente',
      observacion: updatedObservacion
    };
  }

  async remove(id: string, coordinadorId: string): Promise<{ success: boolean; message: string }> {

    const observacion = await this.findOne(id);

    // Validar que quien elimina es coordinador
    const coordinador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: coordinadorId },
      relations: ['idRol']
    });

    if (!coordinador || coordinador.idRol.nombre !== 'COORDINADOR') {
      throw new ForbiddenException('Solo los coordinadores pueden eliminar observaciones');
    }

    // Solo permitir eliminación si está en estado ACTIVA
    if (observacion.estado !== EstadoObservacionDocente.ACTIVA) {
      throw new BadRequestException('Solo se pueden eliminar observaciones en estado ACTIVA');
    }

    await this.observacionRepository.delete(id);

    return {
      success: true,
      message: 'Observación docente eliminada correctamente'
    };
  }
}
