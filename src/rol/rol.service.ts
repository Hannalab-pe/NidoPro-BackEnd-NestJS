import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) { }

  async create(createRolDto: CreateRolDto): Promise<{ sucess: boolean; message: string; rol: Rol }> {
    const rol = this.rolRepository.create(createRolDto);
    await this.rolRepository.save(rol);
    return {
      sucess: true,
      message: 'Rol creado correctamente',
      rol,
    }
  }

  async findAll(): Promise<{ sucess: boolean; message: string; roles: Rol[] }> {
    const roles = await this.rolRepository.find();
    return {
      sucess: true,
      message: 'Roles encontrados correctamente',
      roles,
    };
  }

  async findOne(id: string): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { idRol: id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async update(id: string, updateRolDto: UpdateRolDto): Promise<{ sucess: boolean; message: string; rol: Rol }> {
    const rol = await this.findOne(id);
    await this.rolRepository.update(id, updateRolDto);
    await this.findOne(id);
    return {
      sucess: true,
      message: 'Rol actualizado correctamente',
      rol,
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const rol = await this.findOne(id);
    rol.estaActivo = false;
    await this.rolRepository.update(id, rol);
    return {
      message: `Rol ${rol.nombre} desactivado correctamente`,
    };
  }
}
