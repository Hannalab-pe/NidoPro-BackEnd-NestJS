import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRenovacionContratoDto } from './dto/create-renovacion-contrato.dto';
import { UpdateRenovacionContratoDto } from './dto/update-renovacion-contrato.dto';
import { RenovacionContrato } from './entities/renovacion-contrato.entity';

@Injectable()
export class RenovacionContratoService {
  constructor(
    @InjectRepository(RenovacionContrato)
    private readonly renovacionRepository: Repository<RenovacionContrato>
  ) { }

  async create(createRenovacionContratoDto: CreateRenovacionContratoDto): Promise<RenovacionContrato> {
    try {
      const renovacion = this.renovacionRepository.create({
        ...createRenovacionContratoDto,
        fechaAprobacion: new Date(),
        creadoEn: new Date(),
        // Configurar las relaciones
        idContratoAnterior: { idContrato: createRenovacionContratoDto.idContratoAnterior } as any,
        idContratoNuevo: { idContrato: createRenovacionContratoDto.idContratoNuevo } as any,
        aprobadoPor: { idTrabajador: createRenovacionContratoDto.aprobadoPor } as any
      });

      return await this.renovacionRepository.save(renovacion);
    } catch (error) {
      throw new BadRequestException('Error al crear la renovación: ' + error.message);
    }
  }

  async findAll(): Promise<RenovacionContrato[]> {
    return await this.renovacionRepository.find({
      relations: [
        'idContratoAnterior',
        'idContratoAnterior.idTrabajador2',
        'idContratoNuevo',
        'aprobadoPor'
      ],
      order: { fechaRenovacion: 'DESC' }
    });
  }

  async findByContrato(idContrato: string): Promise<RenovacionContrato[]> {
    return await this.renovacionRepository.find({
      where: [
        { idContratoAnterior: { idContrato } },
        { idContratoNuevo: { idContrato } }
      ],
      relations: [
        'idContratoAnterior',
        'idContratoNuevo',
        'aprobadoPor'
      ],
      order: { fechaRenovacion: 'DESC' }
    });
  }

  async findByTrabajador(idTrabajador: string): Promise<RenovacionContrato[]> {
    return await this.renovacionRepository
      .createQueryBuilder('renovacion')
      .leftJoinAndSelect('renovacion.idContratoAnterior', 'contratoAnterior')
      .leftJoinAndSelect('renovacion.idContratoNuevo', 'contratoNuevo')
      .leftJoinAndSelect('renovacion.aprobadoPor', 'aprobador')
      .leftJoinAndSelect('contratoAnterior.idTrabajador2', 'trabajador')
      .where('trabajador.idTrabajador = :idTrabajador', { idTrabajador })
      .orderBy('renovacion.fechaRenovacion', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<RenovacionContrato> {
    const renovacion = await this.renovacionRepository.findOne({
      where: { idRenovacion: id },
      relations: [
        'idContratoAnterior',
        'idContratoAnterior.idTrabajador2',
        'idContratoAnterior.idTipoContrato',
        'idContratoNuevo',
        'idContratoNuevo.idTrabajador2',
        'idContratoNuevo.idTipoContrato',
        'aprobadoPor'
      ]
    });

    if (!renovacion) {
      throw new NotFoundException(`Renovación con ID ${id} no encontrada`);
    }

    return renovacion;
  }

  async update(id: string, updateRenovacionContratoDto: UpdateRenovacionContratoDto): Promise<RenovacionContrato> {
    const renovacion = await this.findOne(id);

    Object.assign(renovacion, updateRenovacionContratoDto);

    try {
      return await this.renovacionRepository.save(renovacion);
    } catch (error) {
      throw new BadRequestException('Error al actualizar la renovación: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    const renovacion = await this.findOne(id);
    await this.renovacionRepository.remove(renovacion);
  }

  /**
   * Obtener estadísticas de renovaciones
   */
  async getEstadisticasRenovaciones() {
    const [
      totalRenovaciones,
      renovacionesUltimoMes,
      renovacionesUltimoTrimestre
    ] = await Promise.all([
      this.renovacionRepository.count(),
      this.renovacionRepository
        .createQueryBuilder('renovacion')
        .where('renovacion.fechaRenovacion >= :fechaInicio', {
          fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .getCount(),
      this.renovacionRepository
        .createQueryBuilder('renovacion')
        .where('renovacion.fechaRenovacion >= :fechaInicio', {
          fechaInicio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .getCount()
    ]);

    // Promedio de incremento salarial en renovaciones
    const promedioIncremento = await this.renovacionRepository
      .createQueryBuilder('renovacion')
      .select('AVG(CAST(renovacion.sueldoNuevo AS DECIMAL) - CAST(renovacion.sueldoAnterior AS DECIMAL))', 'promedioIncremento')
      .getRawOne();

    return {
      totalRenovaciones,
      renovacionesUltimoMes,
      renovacionesUltimoTrimestre,
      promedioIncrementoSalarial: parseFloat(promedioIncremento?.promedioIncremento || '0')
    };
  }

  /**
   * Obtener renovaciones por período
   */
  async getRenovacionesPorPeriodo(fechaInicio: string, fechaFin: string): Promise<RenovacionContrato[]> {
    return await this.renovacionRepository
      .createQueryBuilder('renovacion')
      .leftJoinAndSelect('renovacion.idContratoAnterior', 'contratoAnterior')
      .leftJoinAndSelect('contratoAnterior.idTrabajador2', 'trabajador')
      .leftJoinAndSelect('renovacion.aprobadoPor', 'aprobador')
      .where('renovacion.fechaRenovacion BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin
      })
      .orderBy('renovacion.fechaRenovacion', 'DESC')
      .getMany();
  }
}
