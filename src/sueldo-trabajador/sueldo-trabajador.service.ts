import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSueldoTrabajadorDto } from './dto/create-sueldo-trabajador.dto';
import { UpdateSueldoTrabajadorDto } from './dto/update-sueldo-trabajador.dto';
import { SueldoTrabajador } from './entities/sueldo-trabajador.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';

@Injectable()
export class SueldoTrabajadorService {
  constructor(
    @InjectRepository(SueldoTrabajador)
    private readonly sueldoTrabajadorRepository: Repository<SueldoTrabajador>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) { }

  async create(createSueldoTrabajadorDto: CreateSueldoTrabajadorDto): Promise<{
    success: boolean;
    message: string;
    sueldo: SueldoTrabajador;
  }> {
    // Verificar que el trabajador existe
    const trabajador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createSueldoTrabajadorDto.idTrabajador },
    });

    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    // Verificar que el trabajador que crea el registro existe
    const trabajadorCreador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createSueldoTrabajadorDto.creadoPor },
    });

    if (!trabajadorCreador) {
      throw new NotFoundException(
        'El trabajador creador especificado no existe',
      );
    }

    // Validar fechas de vigencia
    const fechaDesde = new Date(createSueldoTrabajadorDto.fechaVigenciaDesde);
    const fechaHasta = createSueldoTrabajadorDto.fechaVigenciaHasta
      ? new Date(createSueldoTrabajadorDto.fechaVigenciaHasta)
      : null;

    if (fechaHasta && fechaHasta <= fechaDesde) {
      throw new BadRequestException(
        'La fecha de vigencia hasta debe ser posterior a la fecha de vigencia desde',
      );
    }

    // Crear el sueldo trabajador
    const sueldo = this.sueldoTrabajadorRepository.create({
      sueldoBase: createSueldoTrabajadorDto.sueldoBase,
      bonificacionFamiliar:
        createSueldoTrabajadorDto.bonificacionFamiliar || '0.00',
      asignacionFamiliar:
        createSueldoTrabajadorDto.asignacionFamiliar || '0.00',
      otrosIngresos: createSueldoTrabajadorDto.otrosIngresos || '0.00',
      fechaAsignacion: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      fechaVigenciaDesde: createSueldoTrabajadorDto.fechaVigenciaDesde,
      fechaVigenciaHasta: createSueldoTrabajadorDto.fechaVigenciaHasta || null,
      estaActivo: createSueldoTrabajadorDto.estaActivo ?? true,
      observaciones: createSueldoTrabajadorDto.observaciones || null,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    // Asignar relaciones
    sueldo.idTrabajador = trabajador;
    sueldo.creadoPor = trabajadorCreador;

    const savedSueldo = await this.sueldoTrabajadorRepository.save(sueldo);

    return {
      success: true,
      message: 'Sueldo de trabajador creado correctamente',
      sueldo: savedSueldo,
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    sueldos: SueldoTrabajador[];
  }> {
    const sueldos = await this.sueldoTrabajadorRepository.find({
      relations: ['idTrabajador', 'creadoPor'],
      order: { creadoEn: 'DESC' },
    });

    return {
      success: true,
      message: 'Sueldos de trabajadores obtenidos correctamente',
      sueldos,
    };
  }

  async findOne(id: string): Promise<SueldoTrabajador> {
    const sueldo = await this.sueldoTrabajadorRepository.findOne({
      where: { idSueldoTrabajador: id },
      relations: ['idTrabajador', 'creadoPor'],
    });

    if (!sueldo) {
      throw new NotFoundException(
        `Sueldo de trabajador con ID ${id} no encontrado`,
      );
    }

    return sueldo;
  }

  async update(
    id: string,
    updateSueldoTrabajadorDto: UpdateSueldoTrabajadorDto,
  ): Promise<{
    success: boolean;
    message: string;
    sueldo: SueldoTrabajador;
  }> {
    const sueldo = await this.findOne(id);

    // Verificar trabajador si se actualiza
    if (updateSueldoTrabajadorDto.idTrabajador) {
      const trabajador = await this.trabajadorRepository.findOne({
        where: { idTrabajador: updateSueldoTrabajadorDto.idTrabajador },
      });

      if (!trabajador) {
        throw new NotFoundException('El trabajador especificado no existe');
      }
    }

    // Verificar trabajador creador si se actualiza
    if (updateSueldoTrabajadorDto.creadoPor) {
      const trabajadorCreador = await this.trabajadorRepository.findOne({
        where: { idTrabajador: updateSueldoTrabajadorDto.creadoPor },
      });

      if (!trabajadorCreador) {
        throw new NotFoundException(
          'El trabajador creador especificado no existe',
        );
      }
    }

    // Validar fechas de vigencia si se actualizan
    if (
      updateSueldoTrabajadorDto.fechaVigenciaDesde ||
      updateSueldoTrabajadorDto.fechaVigenciaHasta
    ) {
      const fechaDesde = new Date(
        updateSueldoTrabajadorDto.fechaVigenciaDesde ||
        sueldo.fechaVigenciaDesde,
      );
      const fechaHasta = updateSueldoTrabajadorDto.fechaVigenciaHasta
        ? new Date(updateSueldoTrabajadorDto.fechaVigenciaHasta)
        : sueldo.fechaVigenciaHasta
          ? new Date(sueldo.fechaVigenciaHasta)
          : null;

      if (fechaHasta && fechaHasta <= fechaDesde) {
        throw new BadRequestException(
          'La fecha de vigencia hasta debe ser posterior a la fecha de vigencia desde',
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      ...updateSueldoTrabajadorDto,
      actualizadoEn: new Date(),
    };

    // Asignar relaciones si se actualizan
    if (updateSueldoTrabajadorDto.idTrabajador) {
      updateData.idTrabajador = {
        idTrabajador: updateSueldoTrabajadorDto.idTrabajador,
      } as Trabajador;
    }

    if (updateSueldoTrabajadorDto.creadoPor) {
      updateData.creadoPor = {
        idTrabajador: updateSueldoTrabajadorDto.creadoPor,
      } as Trabajador;
    }

    await this.sueldoTrabajadorRepository.update(id, updateData);

    const sueldoActualizado = await this.findOne(id);

    return {
      success: true,
      message: 'Sueldo de trabajador actualizado correctamente',
      sueldo: sueldoActualizado,
    };
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const sueldo = await this.findOne(id);

    await this.sueldoTrabajadorRepository.delete(id);

    return {
      success: true,
      message: 'Sueldo de trabajador eliminado correctamente',
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  async obtenerSueldoVigenteTrabajador(
    idTrabajador: string,
  ): Promise<SueldoTrabajador | null> {
    // Obtener el sueldo vigente más reciente del trabajador
    const sueldo = await this.sueldoTrabajadorRepository
      .createQueryBuilder('sueldo')
      .where('sueldo.idTrabajador = :idTrabajador', { idTrabajador })
      .andWhere('sueldo.estaActivo = :estaActivo', { estaActivo: true })
      .andWhere('sueldo.fechaVigenciaDesde <= :fechaActual', {
        fechaActual: new Date().toISOString().split('T')[0],
      })
      .andWhere(
        '(sueldo.fechaVigenciaHasta IS NULL OR sueldo.fechaVigenciaHasta >= :fechaActual)',
        { fechaActual: new Date().toISOString().split('T')[0] },
      )
      .orderBy('sueldo.fechaVigenciaDesde', 'DESC')
      .getOne();

    return sueldo;
  }
}
