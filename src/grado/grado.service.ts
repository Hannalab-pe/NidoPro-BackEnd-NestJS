import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGradoDto } from './dto/create-grado.dto';
import { UpdateGradoDto } from './dto/update-grado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Grado } from './entities/grado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GradoService {

  constructor(@InjectRepository(Grado) private readonly gradoRepository: Repository<Grado>) { }

  async findEstudiantesMatriculadosConPension(anioEscolar: number) {
    return this.gradoRepository
      .createQueryBuilder('grado')
      .leftJoinAndSelect('grado.idPension', 'pension')
      .leftJoinAndSelect('grado.matriculas', 'matricula')
      .leftJoinAndSelect('matricula.estudiante', 'estudiante')
      .leftJoinAndSelect('matricula.periodoEscolar', 'periodo')
      .andWhere('EXTRACT(YEAR FROM matricula.fechaIngreso) = :anio', { anio: anioEscolar })
      .andWhere('grado.estaActivo = :gradoActivo', { gradoActivo: true })
      .andWhere('pension.idPension IS NOT NULL')
      .select([
        'estudiante.idEstudiante',
        'estudiante.nombres',
        'estudiante.apellidoPaterno',
        'estudiante.apellidoMaterno',
        'grado.idGrado',
        'grado.grado',
        'pension.idPension',
        'pension.monto',
        'pension.fechaVencimientoMensual',
        'pension.moraDiaria',
        'pension.descuentoPagoAdelantado'
      ])
      .getMany();
  }

  async verificarGradosConPensionConfigurada(): Promise<{
    gradosSinPension: any[];
    todosConfigurados: boolean;
  }> {
    const gradosSinPension = await this.gradoRepository
      .createQueryBuilder('grado')
      .where('grado.estaActivo = :activo', { activo: true })
      .andWhere('grado.idPension IS NULL')
      .getMany();

    return {
      gradosSinPension,
      todosConfigurados: gradosSinPension.length === 0
    };
  }

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
      throw new NotFoundException(`Grado with id ${id} not found`);
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
