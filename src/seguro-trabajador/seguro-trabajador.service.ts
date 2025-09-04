import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSeguroTrabajadorDto } from './dto/create-seguro-trabajador.dto';
import { UpdateSeguroTrabajadorDto } from './dto/update-seguro-trabajador.dto';
import { SeguroTrabajador } from './entities/seguro-trabajador.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { TipoSeguro } from '../tipo-seguro/entities/tipo-seguro.entity';

@Injectable()
export class SeguroTrabajadorService {
  constructor(
    @InjectRepository(SeguroTrabajador)
    private readonly seguroTrabajadorRepository: Repository<SeguroTrabajador>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(TipoSeguro)
    private readonly tipoSeguroRepository: Repository<TipoSeguro>,
  ) {}

  async create(createSeguroTrabajadorDto: CreateSeguroTrabajadorDto) {
    // Validar que el trabajador exista
    const trabajador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createSeguroTrabajadorDto.idTrabajador },
    });
    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    // Validar que el tipo de seguro exista
    const tipoSeguro = await this.tipoSeguroRepository.findOne({
      where: { idTipoSeguro: createSeguroTrabajadorDto.idTipoSeguro },
    });
    if (!tipoSeguro) {
      throw new NotFoundException('El tipo de seguro especificado no existe');
    }

    // Validar que el creador exista
    const creador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createSeguroTrabajadorDto.creadoPor },
    });
    if (!creador) {
      throw new NotFoundException(
        'El trabajador creador especificado no existe',
      );
    }

    // Validar fechas
    if (createSeguroTrabajadorDto.fechaFin) {
      const fechaInicio = new Date(createSeguroTrabajadorDto.fechaInicio);
      const fechaFin = new Date(createSeguroTrabajadorDto.fechaFin);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }
    }

    const seguroTrabajador = this.seguroTrabajadorRepository.create({
      idTrabajador: createSeguroTrabajadorDto.idTrabajador,
      idTipoSeguro: createSeguroTrabajadorDto.idTipoSeguro,
      fechaInicio: createSeguroTrabajadorDto.fechaInicio,
      fechaFin: createSeguroTrabajadorDto.fechaFin,
      observaciones: createSeguroTrabajadorDto.observaciones,
      fechaAsignacion: new Date().toISOString().split('T')[0],
      estaActivo: createSeguroTrabajadorDto.estaActivo ?? true,
      creadoPor: {
        idTrabajador: createSeguroTrabajadorDto.creadoPor,
      } as Trabajador,
      idTrabajador2: {
        idTrabajador: createSeguroTrabajadorDto.idTrabajador,
      } as Trabajador,
      idTipoSeguro2: {
        idTipoSeguro: createSeguroTrabajadorDto.idTipoSeguro,
      } as TipoSeguro,
    });

    const savedSeguroTrabajador =
      await this.seguroTrabajadorRepository.save(seguroTrabajador);

    // Cargar las relaciones para la respuesta
    const seguroConRelaciones = await this.seguroTrabajadorRepository.findOne({
      where: { idSeguroTrabajador: savedSeguroTrabajador.idSeguroTrabajador },
      relations: ['idTrabajador2', 'idTipoSeguro2', 'creadoPor'],
    });

    return {
      success: true,
      message: 'Seguro de trabajador creado correctamente',
      seguroTrabajador: seguroConRelaciones,
    };
  }

  async findAll() {
    const seguros = await this.seguroTrabajadorRepository.find({
      relations: ['idTrabajador2', 'idTipoSeguro2', 'creadoPor'],
      order: { fechaAsignacion: 'DESC' },
    });

    return {
      success: true,
      message: 'Seguros de trabajadores obtenidos correctamente',
      seguros,
    };
  }

  async findOne(id: string): Promise<SeguroTrabajador> {
    const seguroTrabajador = await this.seguroTrabajadorRepository.findOne({
      where: { idSeguroTrabajador: id },
      relations: ['idTrabajador2', 'idTipoSeguro2', 'creadoPor'],
    });

    if (!seguroTrabajador) {
      throw new NotFoundException(
        `Seguro de trabajador con ID ${id} no encontrado`,
      );
    }

    return seguroTrabajador;
  }

  async update(
    id: string,
    updateSeguroTrabajadorDto: UpdateSeguroTrabajadorDto,
  ) {
    const seguroTrabajador = await this.findOne(id);

    // Validar trabajador si se actualiza
    if (updateSeguroTrabajadorDto.idTrabajador) {
      const trabajador = await this.trabajadorRepository.findOne({
        where: { idTrabajador: updateSeguroTrabajadorDto.idTrabajador },
      });
      if (!trabajador) {
        throw new NotFoundException('El trabajador especificado no existe');
      }
    }

    // Validar tipo de seguro si se actualiza
    if (updateSeguroTrabajadorDto.idTipoSeguro) {
      const tipoSeguro = await this.tipoSeguroRepository.findOne({
        where: { idTipoSeguro: updateSeguroTrabajadorDto.idTipoSeguro },
      });
      if (!tipoSeguro) {
        throw new NotFoundException('El tipo de seguro especificado no existe');
      }
    }

    // Validar creador si se actualiza
    if (updateSeguroTrabajadorDto.creadoPor) {
      const creador = await this.trabajadorRepository.findOne({
        where: { idTrabajador: updateSeguroTrabajadorDto.creadoPor },
      });
      if (!creador) {
        throw new NotFoundException(
          'El trabajador creador especificado no existe',
        );
      }
    }

    // Validar fechas si se actualizan
    const fechaInicio =
      updateSeguroTrabajadorDto.fechaInicio || seguroTrabajador.fechaInicio;
    const fechaFin =
      updateSeguroTrabajadorDto.fechaFin || seguroTrabajador.fechaFin;

    if (fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (fin <= inicio) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }
    }

    await this.seguroTrabajadorRepository.update(id, {
      idTrabajador: updateSeguroTrabajadorDto.idTrabajador,
      idTipoSeguro: updateSeguroTrabajadorDto.idTipoSeguro,
      fechaInicio: updateSeguroTrabajadorDto.fechaInicio,
      fechaFin: updateSeguroTrabajadorDto.fechaFin,
      observaciones: updateSeguroTrabajadorDto.observaciones,
      estaActivo: updateSeguroTrabajadorDto.estaActivo,
    });

    const updatedSeguroTrabajador = await this.findOne(id);

    return {
      success: true,
      message: 'Seguro de trabajador actualizado correctamente',
      seguroTrabajador: updatedSeguroTrabajador,
    };
  }

  async remove(id: string) {
    const seguroTrabajador = await this.findOne(id);

    await this.seguroTrabajadorRepository.remove(seguroTrabajador);

    return {
      success: true,
      message: 'Seguro de trabajador eliminado correctamente',
    };
  }
}
