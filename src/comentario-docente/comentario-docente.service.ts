import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateComentarioDocenteDto } from './dto/create-comentario-docente.dto';
import { UpdateComentarioDocenteDto } from './dto/update-comentario-docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ComentarioDocente } from './entities/comentario-docente.entity';
import { Repository } from 'typeorm';
import { TrabajadorService } from 'src/trabajador/trabajador.service';

@Injectable()
export class ComentarioDocenteService {
  constructor(
    @InjectRepository(ComentarioDocente)
    private readonly comentarioRepository: Repository<ComentarioDocente>,
    private readonly trabajadorService: TrabajadorService,
  ) {}

  async create(createComentarioDocenteDto: CreateComentarioDocenteDto): Promise<{
    success: boolean;
    message: string;
    comentario: ComentarioDocente;
  }> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorService.findOne(createComentarioDocenteDto.idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    // Validar que el coordinador existe
    const coordinador = await this.trabajadorService.findOne(createComentarioDocenteDto.idCoordinador);
    if (!coordinador) {
      throw new NotFoundException('El coordinador especificado no existe');
    }

    try {
      const nuevoComentario = this.comentarioRepository.create(createComentarioDocenteDto);
      const comentarioGuardado = await this.comentarioRepository.save(nuevoComentario);

      return {
        success: true,
        message: 'Comentario docente creado exitosamente',
        comentario: comentarioGuardado,
      };
    } catch (error) {
      throw new BadRequestException('Error al crear el comentario docente: ' + error.message);
    }
  }

  async findAll(): Promise<ComentarioDocente[]> {
    return await this.comentarioRepository.find({
      relations: ['trabajador', 'coordinador'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByTrabajador(idTrabajador: string): Promise<ComentarioDocente[]> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorService.findOne(idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    return await this.comentarioRepository.find({
      where: { idTrabajador },
      relations: ['trabajador', 'coordinador'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ComentarioDocente> {
    const comentario = await this.comentarioRepository.findOne({
      where: { idEvaluacionDocente: id },
      relations: ['trabajador', 'coordinador'],
    });

    if (!comentario) {
      throw new NotFoundException(`No se encontró el comentario docente con ID ${id}`);
    }

    return comentario;
  }

  async update(id: string, updateComentarioDocenteDto: UpdateComentarioDocenteDto): Promise<{
    success: boolean;
    message: string;
    comentario: ComentarioDocente;
  }> {
    const comentarioExistente = await this.findOne(id);

    // Validar trabajador si se está actualizando
    if (updateComentarioDocenteDto.idTrabajador) {
      const trabajador = await this.trabajadorService.findOne(updateComentarioDocenteDto.idTrabajador);
      if (!trabajador) {
        throw new NotFoundException('El trabajador especificado no existe');
      }
    }

    // Validar coordinador si se está actualizando
    if (updateComentarioDocenteDto.idCoordinador) {
      const coordinador = await this.trabajadorService.findOne(updateComentarioDocenteDto.idCoordinador);
      if (!coordinador) {
        throw new NotFoundException('El coordinador especificado no existe');
      }
    }

    try {
      await this.comentarioRepository.update(id, updateComentarioDocenteDto);
      const comentarioActualizado = await this.findOne(id);

      return {
        success: true,
        message: 'Comentario docente actualizado exitosamente',
        comentario: comentarioActualizado,
      };
    } catch (error) {
      throw new BadRequestException('Error al actualizar el comentario docente: ' + error.message);
    }
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const comentario = await this.findOne(id);

    try {
      await this.comentarioRepository.remove(comentario);
      
      return {
        success: true,
        message: 'Comentario docente eliminado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException('Error al eliminar el comentario docente: ' + error.message);
    }
  }
}
