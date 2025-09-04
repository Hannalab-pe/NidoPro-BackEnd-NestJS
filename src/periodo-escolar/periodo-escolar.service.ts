import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePeriodoEscolarDto } from './dto/create-periodo-escolar.dto';
import { UpdatePeriodoEscolarDto } from './dto/update-periodo-escolar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PeriodoEscolar } from './entities/periodo-escolar.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PeriodoEscolarService {

  constructor(@InjectRepository(PeriodoEscolar) private readonly periodoEscolarRepository: Repository<PeriodoEscolar>) { }

  async create(createPeriodoEscolarDto: CreatePeriodoEscolarDto): Promise<{ success: boolean; message: string; periodo: PeriodoEscolar }> {
    // Validar que la fecha de fin sea posterior a la fecha de inicio
    const fechaInicio = new Date(createPeriodoEscolarDto.fechaInicio);
    const fechaFin = new Date(createPeriodoEscolarDto.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar que el año escolar sea mayor a 2020
    if (createPeriodoEscolarDto.anioEscolar <= 2025) {
      throw new BadRequestException('El año escolar debe ser mayor a 2025');
    }

    // Verificar que no exista ya un período escolar para ese año
    const periodoExistente = await this.periodoEscolarRepository.findOne({
      where: { anioEscolar: createPeriodoEscolarDto.anioEscolar }
    });

    if (periodoExistente) {
      throw new BadRequestException(`Ya existe un período escolar para el año ${createPeriodoEscolarDto.anioEscolar}`);
    }

    // Si se activa este período, desactivar los demás
    if (createPeriodoEscolarDto.estaActivo !== false) {
      await this.periodoEscolarRepository.update(
        { estaActivo: true },
        { estaActivo: false }
      );
    }

    const periodoEscolar = this.periodoEscolarRepository.create({
      ...createPeriodoEscolarDto,
      estaActivo: createPeriodoEscolarDto.estaActivo ?? true
    });

    const savedPeriodo = await this.periodoEscolarRepository.save(periodoEscolar);

    return {
      success: true,
      message: `Período escolar ${createPeriodoEscolarDto.anioEscolar} creado correctamente`,
      periodo: savedPeriodo
    };
  }

  async findAll(): Promise<{ success: boolean; message: string; periodos: PeriodoEscolar[] }> {
    const periodos = await this.periodoEscolarRepository.find({
      order: { anioEscolar: 'DESC' }
    });

    return {
      success: true,
      message: 'Períodos escolares encontrados correctamente',
      periodos
    };
  }

  async findOne(id: string): Promise<PeriodoEscolar> {
    const periodo = await this.periodoEscolarRepository.findOne({
      where: { idPeriodoEscolar: id }
    });

    if (!periodo) {
      throw new NotFoundException(`Período escolar con ID ${id} no encontrado`);
    }

    return periodo;
  }

  async findPeriodoActual(): Promise<{ success: boolean; message: string; periodo: PeriodoEscolar | null }> {
    const periodoActual = await this.periodoEscolarRepository.findOne({
      where: { estaActivo: true },
      order: { anioEscolar: 'DESC' }
    });

    return {
      success: true,
      message: periodoActual ? 'Período escolar actual encontrado' : 'No hay período escolar activo',
      periodo: periodoActual
    };
  }

  async findByAnio(anio: number): Promise<{ success: boolean; message: string; periodo: PeriodoEscolar | null }> {
    const periodo = await this.periodoEscolarRepository.findOne({
      where: { anioEscolar: anio }
    });

    return {
      success: true,
      message: periodo ? `Período escolar ${anio} encontrado` : `No se encontró período escolar para el año ${anio}`,
      periodo
    };
  }

  async update(id: string, updatePeriodoEscolarDto: UpdatePeriodoEscolarDto): Promise<{ success: boolean; message: string; periodo: PeriodoEscolar }> {
    const periodo = await this.findOne(id);

    // Validar fechas si se están actualizando
    if (updatePeriodoEscolarDto.fechaInicio || updatePeriodoEscolarDto.fechaFin) {
      const fechaInicio = new Date(updatePeriodoEscolarDto.fechaInicio || periodo.fechaInicio);
      const fechaFin = new Date(updatePeriodoEscolarDto.fechaFin || periodo.fechaFin);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Si se activa este período, desactivar los demás
    if (updatePeriodoEscolarDto.estaActivo === true) {
      await this.periodoEscolarRepository.update(
        { estaActivo: true },
        { estaActivo: false }
      );
    }

    await this.periodoEscolarRepository.update(id, updatePeriodoEscolarDto);
    const updatedPeriodo = await this.findOne(id);

    return {
      success: true,
      message: 'Período escolar actualizado correctamente',
      periodo: updatedPeriodo
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const periodo = await this.findOne(id);

    // Verificar si tiene bimestres asociados
    const bimestresCount = await this.periodoEscolarRepository
      .createQueryBuilder('periodo')
      .leftJoin('periodo.bimestres', 'bimestre')
      .where('periodo.idPeriodoEscolar = :id', { id })
      .getCount();

    if (bimestresCount > 0) {
      throw new BadRequestException('No se puede eliminar un período escolar que tiene bimestres asociados');
    }

    await this.periodoEscolarRepository.delete(id);

    return {
      success: true,
      message: `Período escolar ${periodo.anioEscolar} eliminado correctamente`
    };
  }

}
