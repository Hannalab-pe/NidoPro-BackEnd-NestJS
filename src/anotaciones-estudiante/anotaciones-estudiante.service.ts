import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnotacionesEstudianteDto } from './dto/create-anotaciones-estudiante.dto';
import { UpdateAnotacionesEstudianteDto } from './dto/update-anotaciones-estudiante.dto';
import { AnotacionesEstudiante } from './entities/anotaciones-estudiante.entity';
import { EstudianteService } from 'src/estudiante/estudiante.service';
import { TrabajadorService } from 'src/trabajador/trabajador.service';
import { CursoService } from 'src/curso/curso.service';

@Injectable()
export class AnotacionesEstudianteService {
  constructor(
    @InjectRepository(AnotacionesEstudiante)
    private readonly anotacionesEstudianteRepository: Repository<AnotacionesEstudiante>,
    private readonly trabajadorRepository: TrabajadorService,
    private readonly estudianteRepository: EstudianteService,
    private readonly cursoRepository: CursoService,
  ) { }

  async create(createAnotacionesEstudianteDto: CreateAnotacionesEstudianteDto): Promise<{
    success: boolean;
    message: string;
    anotacion: AnotacionesEstudiante;
  }> {
    // Verificar que el trabajador existe
    const trabajador = await this.trabajadorRepository.findOne(createAnotacionesEstudianteDto.idTrabajador);

    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe o está inactivo');
    }

    // Verificar que el estudiante existe
    const estudiante = await this.estudianteRepository.findOne(createAnotacionesEstudianteDto.idEstudiante);

    if (!estudiante) {
      throw new NotFoundException('El estudiante especificado no existe');
    }

    // Verificar que el curso existe
    const curso = await this.cursoRepository.findOne(createAnotacionesEstudianteDto.idCurso);

    if (!curso) {
      throw new NotFoundException('El curso especificado no existe o está inactivo');
    }

    // Crear la anotación
    const anotacion = this.anotacionesEstudianteRepository.create({
      idTrabajador: createAnotacionesEstudianteDto.idTrabajador,
      idEstudiante: createAnotacionesEstudianteDto.idEstudiante,
      titulo: createAnotacionesEstudianteDto.titulo,
      observacion: createAnotacionesEstudianteDto.observacion || null,
      fechaObservacion: createAnotacionesEstudianteDto.fechaObservacion,
      idCurso: createAnotacionesEstudianteDto.idCurso,
      estaActivo: createAnotacionesEstudianteDto.estaActivo ?? true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });

    const savedAnotacion = await this.anotacionesEstudianteRepository.save(anotacion);

    return {
      success: true,
      message: 'Anotación de estudiante creada correctamente',
      anotacion: savedAnotacion,
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    anotaciones: AnotacionesEstudiante[];
  }> {
    const anotaciones = await this.anotacionesEstudianteRepository.find({
      where: { estaActivo: true },
      relations: ['trabajador', 'estudiante', 'curso'],
      order: { fechaCreacion: 'DESC' },
    });

    return {
      success: true,
      message: 'Anotaciones obtenidas correctamente',
      anotaciones,
    };
  }

  async findByEstudiante(idEstudiante: string): Promise<{
    success: boolean;
    message: string;
    anotaciones: AnotacionesEstudiante[];
  }> {
    const anotaciones = await this.anotacionesEstudianteRepository.find({
      where: { idEstudiante, estaActivo: true },
      relations: ['trabajador', 'estudiante', 'curso'],
      order: { fechaObservacion: 'DESC' },
    });

    return {
      success: true,
      message: 'Anotaciones del estudiante obtenidas correctamente',
      anotaciones,
    };
  }

  async findByTrabajador(idTrabajador: string): Promise<{
    success: boolean;
    message: string;
    anotaciones: AnotacionesEstudiante[];
  }> {
    const anotaciones = await this.anotacionesEstudianteRepository.find({
      where: { idTrabajador, estaActivo: true },
      relations: ['trabajador', 'estudiante', 'curso'],
      order: { fechaObservacion: 'DESC' },
    });

    return {
      success: true,
      message: 'Anotaciones del trabajador obtenidas correctamente',
      anotaciones,
    };
  }

  async findByCurso(idCurso: string): Promise<{
    success: boolean;
    message: string;
    anotaciones: AnotacionesEstudiante[];
  }> {
    const anotaciones = await this.anotacionesEstudianteRepository.find({
      where: { idCurso, estaActivo: true },
      relations: ['trabajador', 'estudiante', 'curso'],
      order: { fechaObservacion: 'DESC' },
    });

    return {
      success: true,
      message: 'Anotaciones del curso obtenidas correctamente',
      anotaciones,
    };
  }

  async findOne(id: string): Promise<AnotacionesEstudiante> {
    const anotacion = await this.anotacionesEstudianteRepository.findOne({
      where: { idAnotacionAlumno: id, estaActivo: true },
      relations: ['trabajador', 'estudiante', 'curso'],
    });

    if (!anotacion) {
      throw new NotFoundException(`Anotación con ID ${id} no encontrada`);
    }

    return anotacion;
  }

  async update(
    id: string,
    updateAnotacionesEstudianteDto: UpdateAnotacionesEstudianteDto,
  ): Promise<{
    success: boolean;
    message: string;
    anotacion: AnotacionesEstudiante;
  }> {
    const anotacion = await this.findOne(id);

    // Verificar entidades relacionadas si se actualizan
    if (updateAnotacionesEstudianteDto.idTrabajador) {
      const trabajador = await this.trabajadorRepository.findOne(updateAnotacionesEstudianteDto.idTrabajador)

      if (!trabajador) {
        throw new NotFoundException('El trabajador especificado no existe o está inactivo');
      }
    }

    if (updateAnotacionesEstudianteDto.idEstudiante) {
      const estudiante = await this.estudianteRepository.findOne(updateAnotacionesEstudianteDto.idEstudiante);

      if (!estudiante) {
        throw new NotFoundException('El estudiante especificado no existe');
      }
    }

    if (updateAnotacionesEstudianteDto.idCurso) {
      const curso = await this.cursoRepository.findOne(updateAnotacionesEstudianteDto.idCurso);

      if (!curso) {
        throw new NotFoundException('El curso especificado no existe o está inactivo');
      }
    }

    // Actualizar la anotación
    await this.anotacionesEstudianteRepository.update(id, {
      ...updateAnotacionesEstudianteDto,
      fechaActualizacion: new Date(),
    });

    const anotacionActualizada = await this.findOne(id);

    return {
      success: true,
      message: 'Anotación actualizada correctamente',
      anotacion: anotacionActualizada,
    };
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const anotacion = await this.findOne(id);

    // Soft delete
    await this.anotacionesEstudianteRepository.update(id, {
      estaActivo: false,
      fechaActualizacion: new Date(),
    });

    return {
      success: true,
      message: 'Anotación eliminada correctamente',
    };
  }
}
