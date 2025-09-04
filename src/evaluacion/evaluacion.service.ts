import { Injectable } from '@nestjs/common';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluacion } from './entities/evaluacion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EvaluacionService {

  constructor(@InjectRepository(Evaluacion) private readonly evaluacionRepository: Repository<Evaluacion>) { }


  async create(createEvaluacionDto: CreateEvaluacionDto): Promise<Evaluacion> {
    const evaluacionData = {
      fecha: createEvaluacionDto.fecha,
      descripcion: createEvaluacionDto.descripcion,
      tipoEvaluacion: createEvaluacionDto.tipoEvaluacion || 'EXAMEN',
      idCurso: { idCurso: createEvaluacionDto.idCurso }
    };
    const evaluacion = this.evaluacionRepository.create(evaluacionData);
    return await this.evaluacionRepository.save(evaluacion);
  }

  async findAll(): Promise<Evaluacion[]> {
    return await this.evaluacionRepository.find();
  }

  async findOne(id: string): Promise<Evaluacion | null> {
    return await this.evaluacionRepository.findOne({ where: { idEvaluacion: id } });
  }

  async update(id: string, updateEvaluacionDto: UpdateEvaluacionDto): Promise<Evaluacion | null> {
    const evaluacionFound = await this.evaluacionRepository.findOne({ where: { idEvaluacion: id } });
    if (!evaluacionFound) {
      throw new Error(`Evaluacion with id ${id} not found`);
    }

    const updateData: any = {
      fecha: updateEvaluacionDto.fecha,
      descripcion: updateEvaluacionDto.descripcion,
      tipoEvaluacion: updateEvaluacionDto.tipoEvaluacion,
    };

    if (updateEvaluacionDto.idCurso) {
      updateData.idCurso = { idCurso: updateEvaluacionDto.idCurso };
    }

    await this.evaluacionRepository.update({ idEvaluacion: id }, updateData);
    return this.findOne(id);
  }

}
