import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import {
  ChangePasswordDto,
  ForceChangePasswordDto,
} from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { QueryRunner, Repository, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) { }

  // NUEVO MÉTODO - Agregar este método para transacciones con QueryRunner
  async createWithQueryRunner(
    createUsuarioDto: CreateUsuarioDto,
    queryRunner: QueryRunner,
  ) {
    // ¡IMPORTANTE! Hashear la contraseña antes de crear el usuario
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.contrasena,
      saltRounds,
    );

    const usuario = queryRunner.manager.create(Usuario, {
      ...createUsuarioDto,
      contrasena: hashedPassword, // Usar la contraseña hasheada
      cambioContrasena: false, // Asegurar que sea false por defecto
    });
    await queryRunner.manager.save(usuario);
    return {
      success: true,
      message: 'Usuario creado correctamente',
      usuario,
    };
  }

  // NUEVO MÉTODO - Para transacciones con EntityManager
  async createWithManager(
    createUsuarioDto: CreateUsuarioDto,
    manager: EntityManager,
  ) {
    // ¡IMPORTANTE! Hashear la contraseña antes de crear el usuario
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.contrasena,
      saltRounds,
    );

    const usuario = manager.create(Usuario, {
      ...createUsuarioDto,
      contrasena: hashedPassword, // Usar la contraseña hasheada
      cambioContrasena: false, // Asegurar que sea false por defecto
    });
    const savedUsuario = await manager.save(Usuario, usuario);
    return {
      success: true,
      message: 'Usuario creado correctamente',
      usuario: savedUsuario,
    };
  }

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<{ sucess: boolean; message: string; usuario: Usuario }> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.contrasena,
      saltRounds,
    );

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      contrasena: hashedPassword,
      cambioContrasena: false, // Asegurar que sea false por defecto
    });
    await this.usuarioRepository.save(usuario);
    return {
      sucess: true,
      message: 'Usuario creado correctamente',
      usuario,
    };
  }

  async findAll(): Promise<{
    sucess: boolean;
    message: string;
    usuarios: Usuario[];
  }> {
    const usuarios = await this.usuarioRepository.find({
      relations: ['estudiantes', 'trabajadores'],
    });
    return {
      sucess: true,
      message: 'Usuarios encontrados correctamente',
      usuarios,
    };
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: id },
      relations: ['estudiantes', 'trabajadores'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<{ sucess: boolean; message: string; usuario: Usuario }> {
    const usuario = await this.findOne(id);

    // Si se está actualizando la contraseña, hashearla
    const updateData: any = { ...updateUsuarioDto };
    if (updateUsuarioDto.contrasena) {
      const saltRounds = 10;
      updateData.contrasena = await bcrypt.hash(
        updateUsuarioDto.contrasena,
        saltRounds,
      );
    }

    await this.usuarioRepository.update(id, updateData);
    const updatedUsuario = await this.findOne(id);
    return {
      sucess: true,
      message: 'Usuario actualizado correctamente',
      usuario: updatedUsuario,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { contrasenaActual, nuevaContrasena, confirmarContrasena } =
      changePasswordDto;

    // Verificar que las contraseñas nuevas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
      throw new BadRequestException(
        'La nueva contraseña y su confirmación no coinciden',
      );
    }

    // Buscar el usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: userId, estaActivo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      contrasenaActual,
      usuario.contrasena,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(nuevaContrasena, saltRounds);

    // Actualizar la contraseña y marcar que cambió la contraseña
    await this.usuarioRepository.update(userId, {
      contrasena: hashedNewPassword,
      cambioContrasena: true,
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  async forceChangePassword(
    userId: string,
    forceChangePasswordDto: ForceChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { nuevaContrasena, confirmarContrasena } = forceChangePasswordDto;

    // Verificar que las contraseñas nuevas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
      throw new BadRequestException(
        'La nueva contraseña y su confirmación no coinciden',
      );
    }

    // Buscar el usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: userId, estaActivo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(nuevaContrasena, saltRounds);

    // Actualizar la contraseña y marcar que cambió la contraseña
    await this.usuarioRepository.update(userId, {
      contrasena: hashedNewPassword,
      cambioContrasena: true,
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  async getPasswordChangeStatus(
    userId: string,
  ): Promise<{ success: boolean; message: string; cambioContrasena: boolean }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: userId, estaActivo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      success: true,
      message: 'Estado de cambio de contraseña obtenido correctamente',
      cambioContrasena: usuario.cambioContrasena || false,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const usuario = await this.findOne(id);
    usuario.estaActivo = false;
    await this.usuarioRepository.update(id, usuario);
    return {
      message: `Usuario ${usuario.usuario} desactivado correctamente`,
    };
  }
}
