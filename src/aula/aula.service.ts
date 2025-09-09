import { Injectable } from '@nestjs/common';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Aula } from './entities/aula.entity';
import { Repository } from 'typeorm';
import { AsignacionAula } from 'src/asignacion-aula/entities/asignacion-aula.entity';

@Injectable()
export class AulaService {

  constructor(@InjectRepository(Aula) private readonly aulaRepository: Repository<Aula>) { }


  async create(createAulaDto: CreateAulaDto): Promise<Aula> {
    const aulaData = {
      seccion: createAulaDto.seccion,
      cantidadEstudiantes: createAulaDto.cantidadEstudiantes,
      idGrado: { idGrado: createAulaDto.idGrado }
    };
    const aula = this.aulaRepository.create(aulaData);
    return await this.aulaRepository.save(aula);
  }

  async findAll(): Promise<Aula[]> {
    return await this.aulaRepository.find();
  }

  async findOne(id: string): Promise<Aula | null> {
    return await this.aulaRepository.findOne({ where: { idAula: id } });
  }

  // Verificar que el aula existe y pertenece al grado correcto
  async aulaEspecifica(id: string, idGrado: string): Promise<Aula | null> {
    return await this.aulaRepository
      .createQueryBuilder('aula')
      .leftJoinAndSelect('aula.idGrado', 'grado')
      .where('aula.idAula = :idAula', { idAula: id })
      .andWhere('grado.idGrado = :idGrado', { idGrado: idGrado })
      .getOne();
  }

  async buscarPorCantidadGrado(idGrado: string): Promise<Aula[]> {
    const aulasDisponibles = await this.aulaRepository
      .createQueryBuilder('aula')
      .leftJoin('aula.matriculaAula', 'ma', 'ma.estado = :estado', { estado: 'activo' })
      .where('aula.idGrado = :idGrado', { idGrado: idGrado })
      .groupBy('aula.idAula, aula.seccion, aula.cantidadEstudiantes')
      .having('COUNT(ma.idMatriculaAula) < aula.cantidadEstudiantes OR aula.cantidadEstudiantes IS NULL')
      .orderBy('COUNT(ma.idMatriculaAula)', 'ASC')
      .addOrderBy('aula.seccion', 'ASC')
      .getMany();

    return aulasDisponibles;
  }

  async update(id: string, updateAulaDto: UpdateAulaDto): Promise<Aula | null> {
    const aulaFound = await this.aulaRepository.findOne({ where: { idAula: id } });
    if (!aulaFound) {
      throw new Error(`Aula with id ${id} not found`);
    }

    const updateData: any = {
      seccion: updateAulaDto.seccion,
      cantidadEstudiantes: updateAulaDto.cantidadEstudiantes,
    };

    if (updateAulaDto.idGrado) {
      updateData.idGrado = { idGrado: updateAulaDto.idGrado };
    }

    await this.aulaRepository.update({ idAula: id }, updateData);
    return this.findOne(id);
  }

  async getAsignacionesDeAula(idAula: string): Promise<AsignacionAula[]> {
    const aula = await this.aulaRepository.findOne({
      where: { idAula: idAula },
      relations: ['asignacionAulas', 'asignacionAulas.idTrabajador'],
    });
    if (!aula) {
      throw new Error(`Aula with id ${idAula} not found`);
    }
    return aula.asignacionAulas;
  }

  async getAulasDisponiblesConDetalles(idGrado: string): Promise<any[]> {
    const aulasConDetalles = await this.aulaRepository
      .createQueryBuilder('aula')
      .leftJoin('aula.matriculaAula', 'ma', 'ma.estado = :estado', { estado: 'activo' })
      .leftJoin('aula.idGrado', 'grado')
      .where('aula.idGrado = :idGrado', { idGrado: idGrado })
      .select([
        'aula.idAula',
        'aula.seccion',
        'aula.cantidadEstudiantes',
        'COUNT(ma.idMatriculaAula) as estudiantesAsignados'
      ])
      .groupBy('aula.idAula, aula.seccion, aula.cantidadEstudiantes')
      .having('COUNT(ma.idMatriculaAula) < aula.cantidadEstudiantes OR aula.cantidadEstudiantes IS NULL')
      .orderBy('COUNT(ma.idMatriculaAula)', 'ASC')
      .addOrderBy('aula.seccion', 'ASC')
      .getRawMany();

    // Transformar los datos para agregar cupos disponibles
    return aulasConDetalles.map(aula => ({
      idAula: aula.aula_idAula,
      seccion: aula.aula_seccion,
      cantidadEstudiantes: parseInt(aula.aula_cantidadEstudiantes) || 0,
      estudiantesAsignados: parseInt(aula.estudiantesAsignados) || 0,
      cuposDisponibles: (parseInt(aula.aula_cantidadEstudiantes) || 0) - (parseInt(aula.estudiantesAsignados) || 0)
    }));
  }

}
