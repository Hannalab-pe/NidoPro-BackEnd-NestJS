import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { MarcarLeidoDto } from './dto/marcar-leido.dto';
import { Notificacion } from './entities/notificacion.entity';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async create(
    createNotificacionDto: CreateNotificacionDto,
  ): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      ...createNotificacionDto,
      fecha: createNotificacionDto.fecha || new Date(),
    });
    return await this.notificacionRepository.save(notificacion);
  }

  async findAll(): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      relations: ['usuario', 'usuarioGenerador'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { idNotificacion: id },
      relations: ['usuario', 'usuarioGenerador'],
    });

    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notificacion;
  }

  async update(
    id: string,
    updateNotificacionDto: UpdateNotificacionDto,
  ): Promise<Notificacion> {
    const notificacion = await this.findOne(id);

    Object.assign(notificacion, updateNotificacionDto);
    return await this.notificacionRepository.save(notificacion);
  }

  async remove(id: string): Promise<void> {
    const notificacion = await this.findOne(id);
    await this.notificacionRepository.remove(notificacion);
  }

  // Métodos especiales
  async findByUsuario(idUsuario: string): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { idUsuario },
      relations: ['trabajador', 'usuarioGenerador'],
      order: { fecha: 'DESC' },
    });
  }

  async findByUsuarioNoLeidas(idUsuario: string): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: {
        idUsuario,
        leido: false,
      },
      relations: ['usuario', 'usuarioGenerador'],
      order: { fecha: 'DESC' },
    });
  }

  async marcarComoLeido(
    id: string,
    marcarLeidoDto?: MarcarLeidoDto,
  ): Promise<Notificacion> {
    const notificacion = await this.findOne(id);

    notificacion.leido = marcarLeidoDto?.leido ?? true;
    return await this.notificacionRepository.save(notificacion);
  }

  async marcarTodasComoLeidas(idUsuario: string): Promise<void> {
    await this.notificacionRepository.update(
      { idUsuario, leido: false },
      { leido: true },
    );
  }

  async contarNoLeidas(idUsuario: string): Promise<number> {
    return await this.notificacionRepository.count({
      where: {
        idUsuario,
        leido: false,
      },
    });
  }

  // Método para crear notificaciones automáticas desde otros módulos
  async crearNotificacionAutomatica(
    titulo: string,
    descripcion: string,
    idUsuario: string,
    generadoPor: string,
  ): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      titulo,
      descripcion,
      fecha: new Date(),
      leido: false,
      idUsuario,
      generadoPor,
    });

    return await this.notificacionRepository.save(notificacion);
  }

  // Método conveniente para crear notificaciones usando idTrabajador (se convierte a idUsuario)
  async crearNotificacionDesdeTrabajador(
    titulo: string,
    descripcion: string,
    idTrabajadorDestino: string,
    idTrabajadorGenerador: string,
    trabajadorService: any, // Inyectado desde el módulo que lo usa
  ): Promise<Notificacion> {
    try {
      // Obtener el trabajador con su relación de usuario
      const trabajador = await trabajadorService.findOne(idTrabajadorDestino);

      if (!trabajador || !trabajador.idUsuario?.idUsuario) {
        throw new Error(
          `El trabajador ${idTrabajadorDestino} no tiene un usuario asociado`,
        );
      }

      return await this.crearNotificacionAutomatica(
        titulo,
        descripcion,
        trabajador.idUsuario.idUsuario, // Convertir a idUsuario
        idTrabajadorGenerador,
      );
    } catch (error) {
      console.error('Error al crear notificación desde trabajador:', error);
      throw error;
    }
  }
}
