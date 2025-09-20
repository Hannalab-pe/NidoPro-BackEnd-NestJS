import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApoderadoDto } from './dto/create-apoderado.dto';
import { UpdateApoderadoDto } from './dto/update-apoderado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Apoderado } from './entities/apoderado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApoderadoService {

  constructor(@InjectRepository(Apoderado) private readonly apoderadoRepository: Repository<Apoderado>) { }


  async findByDocumento(documentoIdentidad: string): Promise<Apoderado | null> {
    return await this.apoderadoRepository.findOne({ where: { documentoIdentidad } });
  }

  async create(createApoderadoDto: CreateApoderadoDto): Promise<Apoderado> {
    const apoderado = this.apoderadoRepository.create(createApoderadoDto);
    return await this.apoderadoRepository.save(apoderado);
  }

  async findAll(): Promise<Apoderado[]> {
    return await this.apoderadoRepository.find();
  }

  async findOne(id: string): Promise<Apoderado | null> {
    return await this.apoderadoRepository.findOne({ where: { idApoderado: id } });
  }

  async update(id: string, updateApoderadoDto: UpdateApoderadoDto): Promise<Apoderado | null> {
    const apoderadorFound = await this.apoderadoRepository.findOne({ where: { idApoderado: id } });
    if (!apoderadorFound) {
      throw new NotFoundException(`Apoderado with id ${id} not found`);
    }
    await this.apoderadoRepository.update({ idApoderado: id }, updateApoderadoDto);
    return this.findOne(id);
  }

  async findEstudiantesByApoderado(): Promise<Apoderado[]> {
    return await this.apoderadoRepository.find({
      relations: [
        'matriculas.idEstudiante'
      ],
    });
  }

}
