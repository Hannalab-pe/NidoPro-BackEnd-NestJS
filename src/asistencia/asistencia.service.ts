import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAsistenciaDto, CreateAsistenciaMasivaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AsistenciaService {

  constructor(@InjectRepository(Asistencia) private readonly asistenciaRepository: Repository<Asistencia>) { }

  // Registro individual de asistencia
  async create(createAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    const asistenciaData = {
      fecha: createAsistenciaDto.fecha,
      hora: createAsistenciaDto.hora,
      asistio: createAsistenciaDto.asistio,
      observaciones: createAsistenciaDto.observaciones,
      idEstudiante: createAsistenciaDto.idEstudiante,
      idAula: createAsistenciaDto.idAula,
      idEstudiante2: { idEstudiante: createAsistenciaDto.idEstudiante },
      idAula2: { idAula: createAsistenciaDto.idAula }
    };
    const asistencia = this.asistenciaRepository.create(asistenciaData);
    return await this.asistenciaRepository.save(asistencia);
  }

  // Registro masivo de asistencia
  async createMasivo(createAsistenciaMasivaDto: CreateAsistenciaMasivaDto): Promise<Asistencia[]> {
    const asistenciasData = createAsistenciaMasivaDto.asistencias.map(asistenciaIndividual => ({
      fecha: createAsistenciaMasivaDto.fecha,
      hora: createAsistenciaMasivaDto.hora,
      asistio: asistenciaIndividual.asistio,
      observaciones: asistenciaIndividual.observaciones,
      idEstudiante: asistenciaIndividual.idEstudiante,
      idAula: createAsistenciaMasivaDto.idAula,
      idEstudiante2: { idEstudiante: asistenciaIndividual.idEstudiante },
      idAula2: { idAula: createAsistenciaMasivaDto.idAula }
    }));

    const asistencias = this.asistenciaRepository.create(asistenciasData);
    return await this.asistenciaRepository.save(asistencias);
  }

  async findAll(): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find();
  }

  // Buscar asistencias por aula y fecha
  async findByAulaAndFecha(idAula: string, fecha: string): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find({
      where: {
        idAula: idAula,
        fecha: fecha
      }
    });
  }

  // Buscar asistencias por estudiante
  async findByEstudiante(idEstudiante: string): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find({
      where: {
        idEstudiante: idEstudiante
      }
    });
  }

  async findOne(id: string): Promise<Asistencia | null> {
    return await this.asistenciaRepository.findOne({ where: { idAsistencia: id } });
  }

  async update(id: string, updateAsistenciaDto: UpdateAsistenciaDto): Promise<Asistencia | null> {
    const asistenciaFound = await this.asistenciaRepository.findOne({ where: { idAsistencia: id } });
    if (!asistenciaFound) {
      throw new NotFoundException(`Asistencia with id ${id} not found`);
    }

    const updateData: any = {
      fecha: updateAsistenciaDto.fecha,
      hora: updateAsistenciaDto.hora,
      asistio: updateAsistenciaDto.asistio,
      observaciones: updateAsistenciaDto.observaciones,
    };

    if (updateAsistenciaDto.idEstudiante) {
      updateData.idEstudiante = updateAsistenciaDto.idEstudiante;
      updateData.idEstudiante2 = { idEstudiante: updateAsistenciaDto.idEstudiante };
    }

    if (updateAsistenciaDto.idAula) {
      updateData.idAula = updateAsistenciaDto.idAula;
      updateData.idAula2 = { idAula: updateAsistenciaDto.idAula };
    }

    await this.asistenciaRepository.update({ idAsistencia: id }, updateData);
    return this.findOne(id);
  }

}
