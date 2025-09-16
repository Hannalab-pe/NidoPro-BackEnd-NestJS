import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Informe } from './entities/informe.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InformeService {

  constructor(@InjectRepository(Informe) private readonly informeRepository: Repository<Informe>) { }


  async create(createInformeDto: CreateInformeDto): Promise<Informe> {
    const informeData = {
      detalleInforme: createInformeDto.detalleInforme,
      fechaRegistro: createInformeDto.fechaRegistro || new Date().toISOString().split('T')[0],
      idEstudiante: { idEstudiante: createInformeDto.idEstudiante },
      idTrabajador: { idTrabajador: createInformeDto.idTrabajador }
    };
    const informe = this.informeRepository.create(informeData);
    return await this.informeRepository.save(informe);
  }

  async findAll(): Promise<Informe[]> {
    return await this.informeRepository.find();
  }

  // Buscar informes por estudiante
  async findByEstudiante(idEstudiante: string): Promise<Informe[]> {
    return await this.informeRepository.find({
      where: {
        idEstudiante: { idEstudiante: idEstudiante }
      }
    });
  }

  // Buscar informes por trabajador/profesor
  async findByTrabajador(idTrabajador: string): Promise<Informe[]> {
    return await this.informeRepository.find({
      where: {
        idTrabajador: { idTrabajador: idTrabajador }
      }
    });
  }

  // Buscar informes por rango de fechas
  async findByFechas(fechaInicio: string, fechaFin: string): Promise<Informe[]> {
    return await this.informeRepository
      .createQueryBuilder('informe')
      .where('informe.fecha_registro >= :fechaInicio', { fechaInicio })
      .andWhere('informe.fecha_registro <= :fechaFin', { fechaFin })
      .getMany();
  }

  async findOne(id: string): Promise<Informe | null> {
    return await this.informeRepository.findOne({ where: { idInforme: id } });
  }

  async update(id: string, updateInformeDto: UpdateInformeDto): Promise<Informe | null> {
    const informeFound = await this.informeRepository.findOne({ where: { idInforme: id } });
    if (!informeFound) {
      throw new NotFoundException(`Informe with id ${id} not found`);
    }

    const updateData: any = {
      detalleInforme: updateInformeDto.detalleInforme,
      fechaRegistro: updateInformeDto.fechaRegistro,
    };

    if (updateInformeDto.idEstudiante) {
      updateData.idEstudiante = { idEstudiante: updateInformeDto.idEstudiante };
    }

    if (updateInformeDto.idTrabajador) {
      updateData.idTrabajador = { idTrabajador: updateInformeDto.idTrabajador };
    }

    await this.informeRepository.update({ idInforme: id }, updateData);
    return this.findOne(id);
  }

}
