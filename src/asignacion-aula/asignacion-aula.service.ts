import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAsignacionAulaDto } from './dto/create-asignacion-aula.dto';
import { UpdateAsignacionAulaDto } from './dto/update-asignacion-aula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AsignacionAula } from './entities/asignacion-aula.entity';
import { Repository } from 'typeorm';
import { AulaService } from 'src/aula/aula.service';
import { TrabajadorService } from 'src/trabajador/trabajador.service';

@Injectable()
export class AsignacionAulaService {
  constructor(
    @InjectRepository(AsignacionAula)
    private readonly asignacionAulaRepository: Repository<AsignacionAula>,
    private readonly aulaService: AulaService,
    private readonly trabajadorService: TrabajadorService,
  ) { }

  async create(createAsignacionAulaDto: CreateAsignacionAulaDto): Promise<{ success: boolean; message: string; asignacionAula: AsignacionAula }> {
    const aulaEncontrada = await this.aulaService.findOne(createAsignacionAulaDto.idAula);
    if (!aulaEncontrada) {
      throw new NotFoundException(`Aula con ID ${createAsignacionAulaDto.idAula} no encontrada`);
    }

    //validar trabajador existente
    const trabajadorEncontrado = await this.trabajadorService.findOne(createAsignacionAulaDto.idTrabajador);
    if (!trabajadorEncontrado) {
      throw new NotFoundException(`Trabajador con ID ${createAsignacionAulaDto.idTrabajador} no encontrado`);
    }

    //Validar Trabajador Existente
    const asignacionExistenteTrabajador = await this.findOneByTrabajadorActivo(createAsignacionAulaDto.idTrabajador);

    if (asignacionExistenteTrabajador) {
      throw new NotFoundException(`El trabajador con ID ${createAsignacionAulaDto.idTrabajador} ya tiene un aula asignada actualmente.`);
    }

    //Validar aula no tenga un trabajador asignado
    const asignacionExistenteAula = await this.asignacionAulaRepository
      .createQueryBuilder('asignacionAula')
      .leftJoinAndSelect('asignacionAula.idAula', 'aula')
      .leftJoinAndSelect('asignacionAula.idTrabajador', 'trabajador')
      .where('aula.idAula = :idAula', { idAula: createAsignacionAulaDto.idAula })
      .andWhere('asignacionAula.estadoActivo = :estadoActivo', { estadoActivo: true })
      .getOne();

    if (asignacionExistenteAula) {
      throw new NotFoundException(`El aula con ID ${createAsignacionAulaDto.idAula} ya tiene un trabajador asignado actualmente.`);
    }

    const asignacionAula = new AsignacionAula();
    asignacionAula.fechaAsignacion = createAsignacionAulaDto.fechaAsignacion || new Date().toISOString().split('T')[0];
    asignacionAula.estadoActivo = createAsignacionAulaDto.estadoActivo ?? true;
    asignacionAula.idAula = aulaEncontrada;
    asignacionAula.idTrabajador = trabajadorEncontrado;

    await this.asignacionAulaRepository.save(asignacionAula);
    return {
      success: true,
      message: 'Asignación de aula creada correctamente',
      asignacionAula,
    };
  }

  async findAll(): Promise<{ success: boolean; message: string; asignacionesAula: AsignacionAula[] }> {
    const asignacionesAula = await this.asignacionAulaRepository.find({
      relations: ['idAula', 'idTrabajador'],
    });
    return {
      success: true,
      message: 'Asignaciones de aula encontradas correctamente',
      asignacionesAula,
    };
  }

  async findOneByTrabajadorActivo(idTrabajador: string): Promise<AsignacionAula | null> {
    const asignacionAula = await this.asignacionAulaRepository
      .createQueryBuilder('asignacionAula')
      .leftJoinAndSelect('asignacionAula.idAula', 'aula')
      .leftJoinAndSelect('asignacionAula.idTrabajador', 'trabajador')
      .where('trabajador.idTrabajador = :idTrabajador', { idTrabajador })
      .andWhere('asignacionAula.estadoActivo = :estadoActivo', { estadoActivo: true })
      .getOne();
    return asignacionAula;
  }

  async findOne(id: string): Promise<AsignacionAula> {
    const asignacionAula = await this.asignacionAulaRepository.findOne({
      where: { idAsignacionAula: id },
      relations: ['idAula', 'idTrabajador'],
    });
    if (!asignacionAula) {
      throw new NotFoundException(`Asignación de aula con ID ${id} no encontrada`);
    }
    return asignacionAula;
  }

  async update(id: string, updateAsignacionAulaDto: UpdateAsignacionAulaDto): Promise<{ success: boolean; message: string; asignacionAula: AsignacionAula }> {
    const asignacionAula = await this.findOne(id);

    const updateData: any = {};
    if (updateAsignacionAulaDto.fechaAsignacion !== undefined) {
      updateData.fechaAsignacion = updateAsignacionAulaDto.fechaAsignacion;
    }
    if (updateAsignacionAulaDto.estadoActivo !== undefined) {
      updateData.estadoActivo = updateAsignacionAulaDto.estadoActivo;
    }
    if (updateAsignacionAulaDto.idAula !== undefined) {
      const aulaEncontrada = await this.aulaService.findOne(updateAsignacionAulaDto.idAula);
      if (!aulaEncontrada) {
        throw new NotFoundException(`Aula con ID ${updateAsignacionAulaDto.idAula} no encontrada`);
      }
      updateData.idAula = aulaEncontrada;
    }
    if (updateAsignacionAulaDto.idTrabajador !== undefined) {
      const trabajadorEncontrado = await this.trabajadorService.findOne(updateAsignacionAulaDto.idTrabajador);
      if (!trabajadorEncontrado) {
        throw new NotFoundException(`Trabajador con ID ${updateAsignacionAulaDto.idTrabajador} no encontrado`);
      }
      updateData.idTrabajador = trabajadorEncontrado;
    }

    await this.asignacionAulaRepository.update({ idAsignacionAula: id }, updateData);
    const updatedAsignacionAula = await this.findOne(id);
    return {
      success: true,
      message: 'Asignación de aula actualizada correctamente',
      asignacionAula: updatedAsignacionAula,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const asignacionAula = await this.findOne(id);
    await this.asignacionAulaRepository.update(
      { idAsignacionAula: id },
      { estadoActivo: false }
    );
    return {
      message: `Asignación de aula desactivada correctamente`,
    };
  }
}
