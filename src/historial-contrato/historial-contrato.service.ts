import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateHistorialContratoDto, AccionHistorialEnum } from './dto/create-historial-contrato.dto';
import { UpdateHistorialContratoDto } from './dto/update-historial-contrato.dto';
import { HistorialContrato } from './entities/historial-contrato.entity';

@Injectable()
export class HistorialContratoService {
  constructor(
    @InjectRepository(HistorialContrato)
    private readonly historialRepository: Repository<HistorialContrato>
  ) { }

  async create(createHistorialContratoDto: CreateHistorialContratoDto): Promise<HistorialContrato> {
    try {
      const historial = this.historialRepository.create({
        ...createHistorialContratoDto,
        fechaAccion: new Date(),
        // Configurar las relaciones
        idContrato: { idContrato: createHistorialContratoDto.idContrato } as any,
        realizadoPor: { idTrabajador: createHistorialContratoDto.realizadoPor } as any
      });

      return await this.historialRepository.save(historial);
    } catch (error) {
      throw new BadRequestException('Error al crear el registro de historial: ' + error.message);
    }
  }

  async findAll(filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    accion?: AccionHistorialEnum;
    idContrato?: string;
    idTrabajador?: string;
    realizadoPor?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: HistorialContrato[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filtros?.page || 1;
    const limit = filtros?.limit || 50;
    const skip = (page - 1) * limit;

    const query = this.historialRepository.createQueryBuilder('historial')
      .leftJoinAndSelect('historial.idContrato', 'contrato')
      .leftJoinAndSelect('contrato.idTrabajador2', 'trabajador')
      .leftJoinAndSelect('historial.realizadoPor', 'realizador');

    // Aplicar filtros
    if (filtros?.fechaDesde && filtros?.fechaHasta) {
      query.andWhere('historial.fechaAccion BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta
      });
    }

    if (filtros?.accion) {
      query.andWhere('historial.accion = :accion', { accion: filtros.accion });
    }

    if (filtros?.idContrato) {
      query.andWhere('historial.idContrato = :idContrato', { idContrato: filtros.idContrato });
    }

    if (filtros?.idTrabajador) {
      query.andWhere('historial.idTrabajador = :idTrabajador', { idTrabajador: filtros.idTrabajador });
    }

    if (filtros?.realizadoPor) {
      query.andWhere('historial.realizadoPor = :realizadoPor', { realizadoPor: filtros.realizadoPor });
    }

    // Contar total
    const total = await query.getCount();

    // Obtener datos paginados
    const data = await query
      .orderBy('historial.fechaAccion', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByContrato(idContrato: string): Promise<HistorialContrato[]> {
    return await this.historialRepository.find({
      where: { idContrato: { idContrato } },
      relations: [
        'idContrato',
        'realizadoPor'
      ],
      order: { fechaAccion: 'DESC' }
    });
  }

  async findByTrabajador(idTrabajador: string): Promise<HistorialContrato[]> {
    return await this.historialRepository.find({
      where: { idTrabajador },
      relations: [
        'idContrato',
        'realizadoPor'
      ],
      order: { fechaAccion: 'DESC' }
    });
  }

  async findByAccion(accion: AccionHistorialEnum): Promise<HistorialContrato[]> {
    return await this.historialRepository.find({
      where: { accion },
      relations: [
        'idContrato',
        'idContrato.idTrabajador2',
        'realizadoPor'
      ],
      order: { fechaAccion: 'DESC' }
    });
  }

  async findByPeriodo(fechaInicio: string, fechaFin: string): Promise<HistorialContrato[]> {
    return await this.historialRepository.find({
      where: {
        fechaAccion: Between(new Date(fechaInicio), new Date(fechaFin))
      },
      relations: [
        'idContrato',
        'idContrato.idTrabajador2',
        'realizadoPor'
      ],
      order: { fechaAccion: 'DESC' }
    });
  }

  async findOne(id: string): Promise<HistorialContrato> {
    const historial = await this.historialRepository.findOne({
      where: { idHistorialContrato: id },
      relations: [
        'idContrato',
        'idContrato.idTrabajador2',
        'idContrato.idTipoContrato',
        'realizadoPor'
      ]
    });

    if (!historial) {
      throw new NotFoundException(`Registro de historial con ID ${id} no encontrado`);
    }

    return historial;
  }

  async update(id: string, updateHistorialContratoDto: UpdateHistorialContratoDto): Promise<HistorialContrato> {
    const historial = await this.findOne(id);

    Object.assign(historial, updateHistorialContratoDto);

    try {
      return await this.historialRepository.save(historial);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el historial: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
  }

  /**
   * Crear múltiples registros de historial (para operaciones masivas)
   */
  async createBatch(historiales: CreateHistorialContratoDto[]): Promise<HistorialContrato[]> {
    const entidades = historiales.map(dto =>
      this.historialRepository.create({
        ...dto,
        fechaAccion: new Date(),
        idContrato: { idContrato: dto.idContrato } as any,
        realizadoPor: { idTrabajador: dto.realizadoPor } as any
      })
    );

    try {
      return await this.historialRepository.save(entidades);
    } catch (error) {
      throw new BadRequestException('Error al crear registros de historial: ' + error.message);
    }
  }

  /**
   * Obtener estadísticas del historial
   */
  async getEstadisticasHistorial() {
    const [
      totalRegistros,
      registrosHoy,
      registrosUltimaSemana
    ] = await Promise.all([
      this.historialRepository.count(),
      this.historialRepository.count({
        where: {
          fechaAccion: Between(
            new Date(new Date().setHours(0, 0, 0, 0)),
            new Date(new Date().setHours(23, 59, 59, 999))
          )
        }
      }),
      this.historialRepository.count({
        where: {
          fechaAccion: Between(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date()
          )
        }
      })
    ]);

    // Contar por tipo de acción
    const accionesPorTipo = await this.historialRepository
      .createQueryBuilder('historial')
      .select('historial.accion', 'accion')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('historial.accion')
      .getRawMany();

    return {
      totalRegistros,
      registrosHoy,
      registrosUltimaSemana,
      accionesPorTipo: accionesPorTipo.reduce((acc, item) => {
        acc[item.accion] = parseInt(item.cantidad);
        return acc;
      }, {})
    };
  }

  /**
   * Obtener historial completo de un contrato específico
   */
  async getHistorialCompletoContrato(idContrato: string): Promise<{
    contrato: any;
    historial: HistorialContrato[];
    resumen: {
      totalCambios: number;
      ultimaModificacion: Date;
      acciones: string[];
    };
  }> {
    const historial = await this.findByContrato(idContrato);

    if (historial.length === 0) {
      throw new NotFoundException(`No se encontró historial para el contrato ${idContrato}`);
    }

    const resumen = {
      totalCambios: historial.length,
      ultimaModificacion: historial[0]?.fechaAccion || new Date(),
      acciones: [...new Set(historial.map(h => h.accion))]
    };

    return {
      contrato: historial[0]?.idContrato,
      historial,
      resumen
    };
  }

  /**
   * Método auxiliar para crear historial desde otros servicios
   */
  async crearRegistroHistorial(datos: {
    idContrato: string;
    idTrabajador: string;
    accion: AccionHistorialEnum;
    estadoAnterior?: string;
    estadoNuevo?: string;
    campoModificado?: string;
    valorAnterior?: string;
    valorNuevo?: string;
    motivo?: string;
    observaciones?: string;
    realizadoPor: string;
    ipUsuario?: string;
    archivoSoporteUrl?: string;
  }): Promise<HistorialContrato> {
    const createDto: CreateHistorialContratoDto = {
      idContrato: datos.idContrato,
      idTrabajador: datos.idTrabajador,
      accion: datos.accion,
      estadoAnterior: datos.estadoAnterior,
      estadoNuevo: datos.estadoNuevo,
      campoModificado: datos.campoModificado,
      valorAnterior: datos.valorAnterior,
      valorNuevo: datos.valorNuevo,
      motivo: datos.motivo,
      observaciones: datos.observaciones,
      realizadoPor: datos.realizadoPor,
      ipUsuario: datos.ipUsuario,
      archivoSoporteUrl: datos.archivoSoporteUrl
    };

    return await this.create(createDto);
  }
}
