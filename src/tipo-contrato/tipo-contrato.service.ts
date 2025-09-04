import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateTipoContratoDto } from './dto/create-tipo-contrato.dto';
import { UpdateTipoContratoDto } from './dto/update-tipo-contrato.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoContrato } from './entities/tipo-contrato.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class TipoContratoService {

  constructor(@InjectRepository(TipoContrato) private readonly tipoContratoRepository: Repository<TipoContrato>) { }

  async findAllActive(): Promise<TipoContrato[]> {
    const contratos = await this.tipoContratoRepository.find({ where: { estaActivo: true } });
    if (contratos.length === 0) {
      throw new NotFoundException('No se encontraron tipos de contrato activos.');
    }
    return contratos;
  }

  // Buscar por nombre o código
  async findByNameOrCode(searchTerm: string): Promise<TipoContrato[]> {
    return await this.tipoContratoRepository.find({
      where: [
        { nombreTipo: Like(`%${searchTerm}%`) },
        { codigo: Like(`%${searchTerm}%`) }
      ],
      order: { nombreTipo: 'ASC' }
    });
  }

  async create(createTipoContratoDto: CreateTipoContratoDto): Promise<TipoContrato> {
    // Validar que no exista un tipo de contrato con el mismo nombre
    const existingByName = await this.tipoContratoRepository.findOne({
      where: { nombreTipo: createTipoContratoDto.nombreTipo }
    });

    if (existingByName) {
      throw new ConflictException(`Ya existe un tipo de contrato con el nombre "${createTipoContratoDto.nombreTipo}"`);
    }

    // Validar que no exista un tipo de contrato con el mismo código
    if (createTipoContratoDto.codigo) {
      const existingByCode = await this.tipoContratoRepository.findOne({
        where: { codigo: createTipoContratoDto.codigo }
      });

      if (existingByCode) {
        throw new ConflictException(`Ya existe un tipo de contrato con el código "${createTipoContratoDto.codigo}"`);
      }
    }

    try {
      const nuevoTipoContrato = this.tipoContratoRepository.create(createTipoContratoDto);
      return await this.tipoContratoRepository.save(nuevoTipoContrato);
    } catch (error) {
      // Manejo de errores específicos de base de datos
      if (error.code === '23505') {
        if (error.constraint === 'tipo_contrato_nombre_key') {
          throw new ConflictException(`Ya existe un tipo de contrato con el nombre "${createTipoContratoDto.nombreTipo}"`);
        } else if (error.constraint === 'tipo_contrato_codigo_key') {
          throw new ConflictException(`Ya existe un tipo de contrato con el código "${createTipoContratoDto.codigo}"`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<TipoContrato[]> {
    const contratos = await this.tipoContratoRepository.find();
    if (contratos.length === 0) {
      throw new NotFoundException('No se encontraron tipos de contrato.');
    }
    return contratos;
  }

  async findOne(id: string): Promise<TipoContrato> {
    const contrato = await this.tipoContratoRepository.findOneBy({ idTipoContrato: id });
    if (!contrato) {
      throw new NotFoundException(`No se encontró el tipo de contrato con ID ${id}.`);
    }
    return contrato;
  }

  async update(id: string, updateTipoContratoDto: UpdateTipoContratoDto): Promise<TipoContrato> {
    const tipoContratoEncontrado = await this.findOne(id);

    // Validar que no exista otro tipo de contrato con el mismo nombre (excluyendo el actual)
    if (updateTipoContratoDto.nombreTipo) {
      const existingByName = await this.tipoContratoRepository.findOne({
        where: { nombreTipo: updateTipoContratoDto.nombreTipo }
      });

      if (existingByName && existingByName.idTipoContrato !== id) {
        throw new ConflictException(`Ya existe un tipo de contrato con el nombre "${updateTipoContratoDto.nombreTipo}"`);
      }
    }

    // Validar que no exista otro tipo de contrato con el mismo código (excluyendo el actual)
    if (updateTipoContratoDto.codigo) {
      const existingByCode = await this.tipoContratoRepository.findOne({
        where: { codigo: updateTipoContratoDto.codigo }
      });

      if (existingByCode && existingByCode.idTipoContrato !== id) {
        throw new ConflictException(`Ya existe un tipo de contrato con el código "${updateTipoContratoDto.codigo}"`);
      }
    }

    try {
      Object.assign(tipoContratoEncontrado, updateTipoContratoDto);
      return await this.tipoContratoRepository.save(tipoContratoEncontrado);
    } catch (error) {
      // Manejo de errores específicos de base de datos
      if (error.code === '23505') {
        if (error.constraint === 'tipo_contrato_nombre_key') {
          throw new ConflictException(`Ya existe un tipo de contrato con el nombre "${updateTipoContratoDto.nombreTipo}"`);
        } else if (error.constraint === 'tipo_contrato_codigo_key') {
          throw new ConflictException(`Ya existe un tipo de contrato con el código "${updateTipoContratoDto.codigo}"`);
        }
      }
      throw error;
    }
  }

  //ELIMINADO LOGICO
  async remove(id: string): Promise<void> {
    const contratoEncontrado = await this.findOne(id);
    contratoEncontrado.estaActivo = false;
    await this.tipoContratoRepository.save(contratoEncontrado);
  }

  // Método para activar un tipo de contrato
  async activate(id: string): Promise<TipoContrato> {
    const tipoContrato = await this.findOne(id);
    tipoContrato.estaActivo = true;
    return await this.tipoContratoRepository.save(tipoContrato);
  }

  // Verificar si existe un tipo de contrato por nombre
  async existsByName(nombre: string): Promise<boolean> {
    const count = await this.tipoContratoRepository.count({
      where: { nombreTipo: nombre }
    });
    return count > 0;
  }

  // Verificar si existe un tipo de contrato por código
  async existsByCode(codigo: string): Promise<boolean> {
    const count = await this.tipoContratoRepository.count({
      where: { codigo: codigo }
    });
    return count > 0;
  }

  // Buscar tipos de contrato que permiten renovación
  async findRenewable(): Promise<TipoContrato[]> {
    return await this.tipoContratoRepository.find({
      where: {
        permiteRenovacion: true,
        estaActivo: true
      },
      order: { nombreTipo: 'ASC' }
    });
  }

  // Buscar tipos de contrato temporales
  async findTemporary(): Promise<TipoContrato[]> {
    return await this.tipoContratoRepository.find({
      where: {
        esTemporal: true,
        estaActivo: true
      },
      order: { nombreTipo: 'ASC' }
    });
  }
}
