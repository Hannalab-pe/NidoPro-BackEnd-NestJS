import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMatriculaAulaDto } from './dto/create-matricula-aula.dto';
import { MatriculaAula } from './entities/matricula-aula.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AulaService } from 'src/aula/aula.service';

@Injectable()
export class MatriculaAulaService {

  constructor(
    @InjectRepository(MatriculaAula)
    private matriculaAulaRepository: Repository<MatriculaAula>,
    private readonly aulaRepository: AulaService,
    private dataSource: DataSource
  ) { }

  // AGREGAR este método completo:
  async cambiarAula(idMatricula: string, nuevaAulaId: string, motivo?: string): Promise<MatriculaAula | null> {
    return await this.dataSource.transaction(async manager => {

      // === PASO 1: Buscar asignación actual ===
      const asignacionActual = await manager.findOne(MatriculaAula, {
        where: { idMatricula, estado: 'activo' },
        relations: ['matricula', 'matricula.idGrado', 'matricula.idEstudiante', 'aula']
      });

      if (!asignacionActual) {
        throw new NotFoundException('No se encontró asignación activa para este estudiante');
      }

      // === PASO 2: Verificar que no sea la misma aula ===
      if (asignacionActual.idAula === nuevaAulaId) {
        throw new BadRequestException('El estudiante ya está asignado a esta aula');
      }

      // === PASO 3: Verificar nueva aula ===
      const nuevaAula = await this.aulaRepository.findOne(nuevaAulaId);

      if (!nuevaAula) {
        throw new NotFoundException('La nueva aula no existe');
      }

      // === PASO 4: Verificar que pertenece al mismo grado ===
      if (nuevaAula.idGrado.idGrado !== asignacionActual.matricula.idGrado.idGrado) {
        throw new BadRequestException(
          `La nueva aula pertenece al grado "${nuevaAula.idGrado.grado}" ` +
          `pero el estudiante está matriculado en "${asignacionActual.matricula.idGrado.grado}"`
        );
      }

      // === PASO 5: Verificar capacidad de la nueva aula ===
      const estudiantesEnNuevaAula = await manager.count(MatriculaAula, {
        where: { idAula: nuevaAulaId, estado: 'activo' }
      });

      if (nuevaAula.cantidadEstudiantes && estudiantesEnNuevaAula >= nuevaAula.cantidadEstudiantes) {
        throw new BadRequestException(
          `La nueva aula "${nuevaAula.seccion}" ha alcanzado su capacidad máxima ` +
          `(${nuevaAula.cantidadEstudiantes} estudiantes)`
        );
      }

      // === PASO 6: Actualizar la asignación existente ===
      asignacionActual.idAula = nuevaAulaId;
      asignacionActual.fechaAsignacion = new Date().toISOString().split('T')[0];

      const asignacionActualizada = await manager.save(MatriculaAula, asignacionActual);

      // === PASO 7: Retornar con datos completos ===
      return await manager.findOne(MatriculaAula, {
        where: { idMatriculaAula: asignacionActualizada.idMatriculaAula },
        relations: [
          'matricula',
          'matricula.idEstudiante',
          'matricula.idGrado',
          'aula',
          'aula.idGrado'
        ]
      });
    });
  }

  async obtenerEstudiantesDelAula(idAula: string): Promise<MatriculaAula[]> {
    return await this.matriculaAulaRepository.createQueryBuilder('matriculaAula')
      .leftJoinAndSelect('matriculaAula.matricula', 'matricula')
      .leftJoinAndSelect('matricula.idEstudiante', 'idEstudiante')
      .leftJoinAndSelect('matricula.idApoderado', 'idApoderado')
      .where('matriculaAula.idAula = :idAula', { idAula })
      .andWhere('matriculaAula.estado = :estado', { estado: 'activo' })
      .orderBy('idEstudiante.apellido', 'ASC')
      .getMany();
  }

  // Ver aula de un estudiante
  async obtenerAulaDelEstudiante(idMatricula: string): Promise<MatriculaAula | null> {
    return await this.matriculaAulaRepository.findOne({
      where: { idMatricula, estado: 'activo' },
      relations: ['aula', 'aula.idGrado', 'matricula', 'matricula.idEstudiante']
    });
  }

  async create(createMatriculaAulaDto: CreateMatriculaAulaDto): Promise<MatriculaAula> {
    const matriculaAula = this.matriculaAulaRepository.create(createMatriculaAulaDto);
    return await this.matriculaAulaRepository.save(matriculaAula);
  }

  // Retirar estudiante
  async retirarEstudiante(idMatricula: string): Promise<MatriculaAula> {
    return await this.dataSource.transaction(async manager => {
      const asignacion = await manager.findOne(MatriculaAula, {
        where: { idMatricula, estado: 'activo' }
      });

      if (!asignacion) {
        throw new NotFoundException('Asignación no encontrada');
      }

      asignacion.estado = 'retirado';
      return await manager.save(MatriculaAula, asignacion);
    });
  }

}
