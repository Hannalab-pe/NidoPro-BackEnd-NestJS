import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { MarcarLeidoDto } from './dto/marcar-leido.dto';
import { Notificacion } from './entities/notificacion.entity';
import * as cron from 'node-cron';

@Injectable()
export class NotificacionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificacionService.name);

  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  onApplicationBootstrap() {
    // Configurar la tarea cron para ejecutarse todos los días a las 2:00 AM
    cron.schedule(
      '00 28 12 * * *',
      async () => {
        this.logger.log('Iniciando limpieza automática de notificaciones...');
        try {
          await this.eliminarNotificacionesAntiguas();
          this.logger.log('Limpieza de notificaciones completada exitosamente');
        } catch (error) {
          this.logger.error(
            'Error durante la limpieza de notificaciones:',
            error,
          );
        }
      },
      {
        timezone: 'America/Lima', // Ajusta según tu zona horaria
      },
    );

    this.logger.log('Tarea cron de limpieza de notificaciones configurada');
  }

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
      relations: ['usuario', 'usuarioGenerador'],
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

  // Tarea programada para eliminar notificaciones leídas hace más de 15 dias
  async eliminarNotificacionesAntiguas(): Promise<number> {
    try {
      // Calcular fecha límite: 15 días atrás desde hoy
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 15);

      // Eliminar notificaciones que cumplan AMBAS condiciones:
      // 1. Que estén leídas (leido = true)
      // 2. Que tengan más de 15 días desde su creación
      const resultado = await this.notificacionRepository.delete({
        leido: true,
        fecha: LessThan(fechaLimite),
      });

      const cantidadEliminada = resultado.affected || 0;

      this.logger.log(
        `Se eliminaron ${cantidadEliminada} notificaciones antiguas`,
      );

      return cantidadEliminada;
    } catch (error) {
      this.logger.error('Error al eliminar notificaciones antiguas:', error);
      throw error;
    }
  }

  // Método público para ejecutar manualmente la limpieza
  async ejecutarLimpiezaManual(): Promise<{
    eliminadas: number;
    mensaje: string;
  }> {
    try {
      const cantidadEliminada = await this.eliminarNotificacionesAntiguas();
      return {
        eliminadas: cantidadEliminada,
        mensaje: `Se eliminaron ${cantidadEliminada} notificaciones leídas con más de 15 días de antigüedad`,
      };
    } catch (error) {
      this.logger.error('Error en limpieza manual:', error);
      throw error;
    }
  }
}
