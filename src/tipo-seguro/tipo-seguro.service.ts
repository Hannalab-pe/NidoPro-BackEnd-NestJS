import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoSeguroDto } from './dto/create-tipo-seguro.dto';
import { UpdateTipoSeguroDto } from './dto/update-tipo-seguro.dto';
import { TipoSeguro } from './entities/tipo-seguro.entity';

@Injectable()
export class TipoSeguroService {
  constructor(
    @InjectRepository(TipoSeguro)
    private readonly tipoSeguroRepository: Repository<TipoSeguro>,
  ) {}

  async create(createTipoSeguroDto: CreateTipoSeguroDto) {
    try {
      const tipoSeguro = this.tipoSeguroRepository.create({
        ...createTipoSeguroDto,
        montoFijo: createTipoSeguroDto.montoFijo || '0.00',
        esObligatorio: createTipoSeguroDto.esObligatorio ?? true,
        estaActivo: createTipoSeguroDto.estaActivo ?? true,
        tipoCalculo: createTipoSeguroDto.tipoCalculo || 'PORCENTAJE',
      });

      const savedTipoSeguro = await this.tipoSeguroRepository.save(tipoSeguro);

      return {
        success: true,
        message: 'Tipo de seguro creado correctamente',
        tipoSeguro: savedTipoSeguro,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Ya existe un tipo de seguro con ese nombre',
        );
      }
      throw error;
    }
  }

  async findAll() {
    const tiposSeguro = await this.tipoSeguroRepository.find({
      order: { nombreSeguro: 'ASC' },
    });

    return {
      success: true,
      message: 'Tipos de seguro obtenidos correctamente',
      tiposSeguro,
    };
  }

  async findOne(id: string): Promise<TipoSeguro> {
    const tipoSeguro = await this.tipoSeguroRepository.findOne({
      where: { idTipoSeguro: id },
    });

    if (!tipoSeguro) {
      throw new NotFoundException(`Tipo de seguro con ID ${id} no encontrado`);
    }

    return tipoSeguro;
  }

  async update(id: string, updateTipoSeguroDto: UpdateTipoSeguroDto) {
    const tipoSeguro = await this.findOne(id);

    try {
      await this.tipoSeguroRepository.update(id, updateTipoSeguroDto);

      const updatedTipoSeguro = await this.findOne(id);

      return {
        success: true,
        message: 'Tipo de seguro actualizado correctamente',
        tipoSeguro: updatedTipoSeguro,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Ya existe un tipo de seguro con ese nombre',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    const tipoSeguro = await this.findOne(id);

    await this.tipoSeguroRepository.remove(tipoSeguro);

    return {
      success: true,
      message: 'Tipo de seguro eliminado correctamente',
    };
  }
}
