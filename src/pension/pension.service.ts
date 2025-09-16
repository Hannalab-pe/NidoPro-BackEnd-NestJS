import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePensionDto } from './dto/create-pension.dto';
import { UpdatePensionDto } from './dto/update-pension.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pension } from './entities/pension.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PensionService {

  constructor(@InjectRepository(Pension) private readonly pensionRepository: Repository<Pension>) { }

  async findPensionesConGrados() {
    return this.pensionRepository
      .createQueryBuilder('pension')
      .leftJoinAndSelect('pension.grados', 'grado')
      .where('grado.estaActivo = :activo', { activo: true })
      .getMany();
  }

  async verificarConfiguracionPensiones(): Promise<{
    pensionesActivas: number;
    gradosAsignados: number;
    gradosSinPension: number;
  }> {
    const [pensionesActivas, gradosConPension, gradosSinPension] = await Promise.all([
      this.pensionRepository.count(),
      this.pensionRepository
        .createQueryBuilder('pension')
        .leftJoin('pension.grados', 'grado')
        .where('grado.estaActivo = :activo', { activo: true })
        .getCount(),
      0
    ]);

    return {
      pensionesActivas,
      gradosAsignados: gradosConPension,
      gradosSinPension
    };
  }

  async create(createPensionDto: CreatePensionDto): Promise<Pension> {
    const pensionData = {
      monto: createPensionDto.monto.toString()
    };
    const pension = this.pensionRepository.create(pensionData);
    return await this.pensionRepository.save(pension);
  }

  async findAll(): Promise<Pension[]> {
    return await this.pensionRepository.find();
  }

  async findOne(id: string): Promise<Pension | null> {
    return await this.pensionRepository.findOne({ where: { idPension: id } });
  }

  async update(id: string, updatePensionDto: UpdatePensionDto): Promise<Pension | null> {
    const pensionFound = await this.pensionRepository.findOne({ where: { idPension: id } });
    if (!pensionFound) {
      throw new NotFoundException(`Pension with id ${id} not found`);
    }

    const updateData: any = {};
    if (updatePensionDto.monto !== undefined) {
      updateData.monto = updatePensionDto.monto.toString();
    }

    await this.pensionRepository.update({ idPension: id }, updateData);
    return this.findOne(id);
  }

}
