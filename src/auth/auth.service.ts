import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string; usuario: any }> {
    const { usuario, contrasena } = loginDto;

    // Buscar usuario por nombre de usuario
    const user = await this.usuarioRepository.findOne({
      where: { usuario, estaActivo: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si es trabajador o estudiante
    const estudiante = await this.estudianteRepository.findOne({
      where: { id_Usuario: user.idUsuario },
      relations: ['idRol']
    });
    
    const trabajador = await this.trabajadorRepository
      .createQueryBuilder('trabajador')
      .leftJoinAndSelect('trabajador.idRol', 'rol')
      .leftJoinAndSelect('trabajador.idUsuario', 'usuario')
      .where('usuario.idUsuario = :userId', { userId: user.idUsuario })
      .getOne();

    let tipo: 'trabajador' | 'estudiante';
    let rol: string | null = null;
    let entidadId: string | null = null;

    if (trabajador) {
      tipo = 'trabajador';
      rol = trabajador.idRol.nombre;
      entidadId = trabajador.idTrabajador;
    } else if (estudiante) {
      tipo = 'estudiante';
      rol = estudiante.idRol?.nombre || 'ESTUDIANTE';
      entidadId = estudiante.idEstudiante;
    } else {
      throw new UnauthorizedException('Usuario no asociado a estudiante ni trabajador');
    }

    const payload = {
      sub: user.idUsuario,
      usuario: user.usuario,
      tipo,
      rol,
      entidadId, // ID del trabajador o estudiante
      fullName: trabajador ? `${trabajador.nombre} ${trabajador.apellido}` :
        estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : user.usuario
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: payload,
    };
  }

  async validateUser(userId: string): Promise<Usuario | null> {
    const user = await this.usuarioRepository.findOne({
      where: { idUsuario: userId, estaActivo: true },
    });
    return user || null;
  }
}
