import { Injectable } from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CursoService {

  constructor(@InjectRepository(Curso) private readonly cursoRepository: Repository<Curso>) { }


  async create(createCursoDto: CreateCursoDto): Promise<Curso> {
    const curso = this.cursoRepository.create(createCursoDto);
    return await this.cursoRepository.save(curso);
  }

  async findAll(): Promise<Curso[]> {
    return await this.cursoRepository.find();
  }

  async findOne(id: string): Promise<Curso> {
    const curso = await this.cursoRepository
      .createQueryBuilder('curso')
      .where('curso.idCurso = :id', { id })
      .getOne();
    if (!curso) {
      throw new Error(`Curso with id ${id} not found`);
    }
    return curso;
  }

  async update(id: string, updateCursoDto: UpdateCursoDto): Promise<Curso | null> {
    const cursoFound = await this.cursoRepository.findOne({ where: { idCurso: id, estaActivo: true } });
    if (!cursoFound) {
      throw new Error(`Curso with id ${id} not found`);
    }
    await this.cursoRepository.update({ idCurso: id }, updateCursoDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const cursoFound = await this.cursoRepository.findOne({ where: { idCurso: id } });
    if (!cursoFound) {
      throw new Error(`Curso with id ${id} not found`);
    }
    cursoFound.estaActivo = false;
    await this.cursoRepository.save(cursoFound);
  }

}
