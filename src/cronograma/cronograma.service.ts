import { Injectable } from '@nestjs/common';
import { CreateCronogramaDto } from './dto/create-cronograma.dto';
import { UpdateCronogramaDto } from './dto/update-cronograma.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cronograma } from './entities/cronograma.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CronogramaService {

  constructor(@InjectRepository(Cronograma) private readonly cronogramaRepository: Repository<Cronograma>) { }


  async create(createCronogramaDto: CreateCronogramaDto): Promise<Cronograma> {
    const cronogramaData = {
      nombreActividad: createCronogramaDto.nombreActividad,
      descripcion: createCronogramaDto.descripcion,
      fechaInicio: createCronogramaDto.fechaInicio,
      fechaFin: createCronogramaDto.fechaFin,
      idAula: { idAula: createCronogramaDto.idAula },
      idTrabajador: { idTrabajador: createCronogramaDto.idTrabajador }
    };
    const cronograma = this.cronogramaRepository.create(cronogramaData);
    return await this.cronogramaRepository.save(cronograma);
  }

  async findAll(): Promise<Cronograma[]> {
    return await this.cronogramaRepository.find();
  }

  async findOne(id: string): Promise<Cronograma | null> {
    return await this.cronogramaRepository.findOne({ where: { idCronograma: id } });
  }

  async update(id: string, updateCronogramaDto: UpdateCronogramaDto): Promise<Cronograma | null> {
    const cronogramaFound = await this.cronogramaRepository.findOne({ where: { idCronograma: id } });
    if (!cronogramaFound) {
      throw new Error(`Cronograma with id ${id} not found`);
    }

    const updateData: any = {
      nombreActividad: updateCronogramaDto.nombreActividad,
      descripcion: updateCronogramaDto.descripcion,
      fechaInicio: updateCronogramaDto.fechaInicio,
      fechaFin: updateCronogramaDto.fechaFin,
    };

    if (updateCronogramaDto.idAula) {
      updateData.idAula = { idAula: updateCronogramaDto.idAula };
    }

    if (updateCronogramaDto.idTrabajador) {
      updateData.idTrabajador = { idTrabajador: updateCronogramaDto.idTrabajador };
    }

    await this.cronogramaRepository.update({ idCronograma: id }, updateData);
    return this.findOne(id);
  }

}
