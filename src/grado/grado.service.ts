import { Injectable } from '@nestjs/common';
import { CreateGradoDto } from './dto/create-grado.dto';
import { UpdateGradoDto } from './dto/update-grado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Grado } from './entities/grado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GradoService {

  constructor(@InjectRepository(Grado) private readonly gradoRepository: Repository<Grado>) { }


  async create(createGradoDto: CreateGradoDto): Promise<Grado> {
    const gradoData = {
      grado: createGradoDto.grado,
      descripcion: createGradoDto.descripcion,
      estaActivo: createGradoDto.estaActivo,
      idPension: { idPension: createGradoDto.idPension }
    };
    const grado = this.gradoRepository.create(gradoData);
    return await this.gradoRepository.save(grado);
  }

  async findAll(): Promise<Grado[]> {
    return await this.gradoRepository.find({
      relations: ['idPension']
    });
  }

  async findOne(id: string): Promise<Grado | null> {
    return await this.gradoRepository.findOne({
      where: { idGrado: id },
      relations: ['idPension']
    });
  }

  async update(id: string, updateGradoDto: UpdateGradoDto): Promise<Grado | null> {
    const gradoFound = await this.gradoRepository.findOne({ where: { idGrado: id } });
    if (!gradoFound) {
      throw new Error(`Grado with id ${id} not found`);
    }

    const updateData: any = {
      grado: updateGradoDto.grado,
      descripcion: updateGradoDto.descripcion,
      estaActivo: updateGradoDto.estaActivo,
    };

    if (updateGradoDto.idPension) {
      updateData.idPension = { idPension: updateGradoDto.idPension };
    }

    await this.gradoRepository.update({ idGrado: id }, updateData);
    return this.findOne(id);
  }

}
