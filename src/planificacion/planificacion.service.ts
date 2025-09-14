import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePlanificacionDto } from './dto/create-planificacion.dto';
import { UpdatePlanificacionDto } from './dto/update-planificacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Planificacion } from './entities/planificacion.entity';
import { Repository } from 'typeorm';
import { TrabajadorService } from 'src/trabajador/trabajador.service';
import { AulaService } from 'src/aula/aula.service';

@Injectable()
export class PlanificacionService {
  constructor(
    @InjectRepository(Planificacion)
    private readonly planificacionRepository: Repository<Planificacion>,
    private readonly trabajadorService: TrabajadorService,
    private readonly aulaService: AulaService,
  ) {}

  async create(createPlanificacionDto: CreatePlanificacionDto): Promise<{
    success: boolean;
    message: string;
    planificacion: Planificacion;
  }> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorService.findOne(createPlanificacionDto.idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    // Validar que el aula existe
    const aula = await this.aulaService.findOne(createPlanificacionDto.idAula);
    if (!aula) {
      throw new NotFoundException('El aula especificada no existe');
    }

    try {
      const nuevaPlanificacion = this.planificacionRepository.create({
        ...createPlanificacionDto,
        fechaPlanificacion: new Date(createPlanificacionDto.fechaPlanificacion),
      });

      const planificacionGuardada = await this.planificacionRepository.save(nuevaPlanificacion);

      return {
        success: true,
        message: 'Planificación creada exitosamente',
        planificacion: planificacionGuardada,
      };
    } catch (error) {
      throw new BadRequestException('Error al crear la planificación: ' + error.message);
    }
  }

  async findAll(): Promise<Planificacion[]> {
    return await this.planificacionRepository.find({
      relations: ['trabajador', 'aula'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByTrabajador(idTrabajador: string): Promise<Planificacion[]> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorService.findOne(idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    return await this.planificacionRepository.find({
      where: { idTrabajador },
      relations: ['trabajador', 'aula'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Planificacion> {
    const planificacion = await this.planificacionRepository.findOne({
      where: { idPlanificacion: id },
      relations: ['trabajador', 'aula'],
    });

    if (!planificacion) {
      throw new NotFoundException(`No se encontró la planificación con ID ${id}`);
    }

    return planificacion;
  }

  async update(id: string, updatePlanificacionDto: UpdatePlanificacionDto): Promise<{
    success: boolean;
    message: string;
    planificacion: Planificacion;
  }> {
    const planificacionExistente = await this.findOne(id);

    // Validar trabajador si se está actualizando
    if (updatePlanificacionDto.idTrabajador) {
      const trabajador = await this.trabajadorService.findOne(updatePlanificacionDto.idTrabajador);
      if (!trabajador) {
        throw new NotFoundException('El trabajador especificado no existe');
      }
    }

    // Validar aula si se está actualizando
    if (updatePlanificacionDto.idAula) {
      const aula = await this.aulaService.findOne(updatePlanificacionDto.idAula);
      if (!aula) {
        throw new NotFoundException('El aula especificada no existe');
      }
    }

    try {
      const datosActualizacion = { ...updatePlanificacionDto };
      
      // Convertir fecha si se proporciona
      if (updatePlanificacionDto.fechaPlanificacion) {
        (datosActualizacion as any).fechaPlanificacion = new Date(updatePlanificacionDto.fechaPlanificacion);
      }

      await this.planificacionRepository.update(id, datosActualizacion);
      const planificacionActualizada = await this.findOne(id);

      return {
        success: true,
        message: 'Planificación actualizada exitosamente',
        planificacion: planificacionActualizada,
      };
    } catch (error) {
      throw new BadRequestException('Error al actualizar la planificación: ' + error.message);
    }
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const planificacion = await this.findOne(id);

    try {
      await this.planificacionRepository.remove(planificacion);
      
      return {
        success: true,
        message: 'Planificación eliminada exitosamente',
      };
    } catch (error) {
      throw new BadRequestException('Error al eliminar la planificación: ' + error.message);
    }
  }
}
